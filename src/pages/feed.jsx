import React, { useState, useEffect, memo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import styles from "./feed.module.css";
import api from "../services/api";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CommentIcon from "@mui/icons-material/Comment";
import MessageIcon from "@mui/icons-material/Message";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// Composant mémoïsé pour chaque post (évite les re-rendus)
const PostCard = memo(({ post, currentUser, onLike, onMessage, onDeleteComment }) => {
  const [liked, setLiked] = useState(post.likesUsers?.includes(currentUser?.id) || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const response = await api.post(`/likes/${post.id}/toggle`, {});
      setLiked(!liked);
      setLikesCount(response.count);
    } catch (error) {
      console.error("Erreur like:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await api.post(`/comments/${post.id}`, { content: newComment });
      setComments([...comments, response]);
      setNewComment("");
    } catch (error) {
      console.error("Erreur commentaire:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error("Erreur suppression commentaire:", error);
    }
  };

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname.includes('rencontreauthentique.org')) {
        return 'https://green-alpaca-449310.hostingersite.com';
      }
    }
    return 'http://localhost:5000';
  };

  const getImageUrl = (photo) => {
    const baseUrl = getBaseUrl();
    if (!photo) return "/default-avatar.png";
    if (photo.startsWith('http')) return photo;
    return `${baseUrl}${photo}`;
  };

  const isOwnPost = currentUser && post.userId === currentUser.id;

  return (
    <div className={`${styles.postCard} ${isOwnPost ? styles.ownPost : ''}`}>
      <div className={styles.postHeader}>
        <Link href={`/profile/${post.userId}`}>
          <Image 
            src={getImageUrl(post.photo)}
            alt={post.prenom}
            width={50}
            height={50}
            className={styles.postUserPhoto}
            unoptimized
            onError={(e) => e.target.src = "/default-avatar.png"}
          />
        </Link>
        <div className={styles.postHeaderInfo}>
          <Link href={`/profile/${post.userId}`} className={styles.profileLink}>
            <strong>{post.prenom} {post.nom}</strong>
            {isOwnPost && <span className={styles.youBadge}>(vous)</span>}
          </Link>
          <p className={styles.postInfo}>
            {post.age} ans | {post.ville} | {post.religion}
          </p>
          <p className={styles.postDate}>
            {new Date(post.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <p className={styles.postContent}>{post.content}</p>

      <div className={styles.postStats}>
        <span>{likesCount} j'aime</span>
        <button className={styles.commentsToggle} onClick={() => setShowComments(!showComments)}>
          {comments.length} commentaires
        </button>
      </div>

      <div className={styles.postActions}>
        <button className={styles.likeBtn} onClick={handleLike} disabled={!currentUser}>
          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          {likesCount}
        </button>
        <button className={styles.commentBtn} onClick={() => setShowComments(!showComments)} disabled={!currentUser}>
          <CommentIcon /> Commenter
        </button>
        <button className={styles.messageBtn} onClick={() => onMessage(post.userId)} disabled={!currentUser || isOwnPost}>
          <MessageIcon /> Message
        </button>
      </div>

      {showComments && (
        <div className={styles.commentsSection}>
          <h4>Commentaires</h4>
          {comments.map(comment => {
            const isOwnComment = currentUser && comment.userId === currentUser.id;
            return (
              <div key={comment.id} className={`${styles.commentItem} ${isOwnComment ? styles.ownComment : ''}`}>
                <Image 
                  src={getImageUrl(comment.photo)}
                  alt={comment.prenom}
                  width={30}
                  height={30}
                  className={styles.commentUserPhoto}
                  unoptimized
                  onError={(e) => e.target.src = "/default-avatar.png"}
                />
                <div className={styles.commentContent}>
                  <strong>{isOwnComment ? "Vous" : `${comment.prenom} ${comment.nom}`}</strong>
                  <p>{comment.content}</p>
                  <small>{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</small>
                </div>
                {isOwnComment && (
                  <button className={styles.deleteCommentBtn} onClick={() => handleDeleteComment(comment.id)}>
                    <DeleteIcon fontSize="small" />
                  </button>
                )}
              </div>
            );
          })}

          {currentUser && (
            <div className={styles.addComment}>
              <input
                type="text"
                placeholder="Écrire un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              />
              <button onClick={handleAddComment} disabled={!newComment.trim()}>
                <SendIcon />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

PostCard.displayName = 'PostCard';

export default function Feed({ user }) {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "💕 Rencontrez votre âme sœur en toute discrétion",
    "✨ Des milliers de célibataires vous attendent",
    "🤫 Votre histoire commence ici, en toute simplicité",
    "💖 L'amour n'attend plus que vous",
    "🌟 Trouvez la personne qui vous correspond vraiment"
  ];

  // Chargement des posts - UNE SEULE REQUÊTE
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await api.get('/posts');
        setPosts(data || []);
      } catch (error) {
        console.error("Erreur chargement feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleMessage = (userId) => {
    if (!user) {
      alert("Veuillez vous connecter");
      router.push("/login");
      return;
    }
    router.push(`/chat?userId=${userId}`);
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.feedContainer}>
      <div className={styles.animatedMessage}>
        <AutoAwesomeIcon className={styles.animatedIcon} />
        <p key={messageIndex} className={styles.messageText}>
          {messages[messageIndex]}
        </p>
      </div>

      <h2 className={styles.feedTitle}>Fil d'actualité</h2>

      {!user ? (
        <div className={styles.loginPrompt}>
          <p className={styles.welcomeTitle}>👋 Bienvenue sur RencontreAuthentique !</p>
          <p className={styles.welcomeMessage}>
            Découvrez les profils et publications des membres.
          </p>
          <div className={styles.promptButtons}>
            <Link href="/login" className={styles.loginButton}>Se connecter</Link>
            <Link href="/register" className={styles.registerButton}>S'inscrire</Link>
          </div>
        </div>
      ) : (
        <div className={styles.connectedMessage}>
          <p>✅ Connecté en tant que {user.prenom}</p>
        </div>
      )}

      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={user}
          onMessage={handleMessage}
        />
      ))}

      {posts.length === 0 && (
        <div className={styles.noPosts}>
          <p>Aucune publication pour le moment</p>
        </div>
      )}
    </div>
  );
}