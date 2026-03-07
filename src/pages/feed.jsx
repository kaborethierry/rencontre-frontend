import React, { useState, useEffect } from "react";
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
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function Feed({ user }) {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(user);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const [messageIndex, setMessageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usersMap, setUsersMap] = useState({});

  const messages = [
    "💕 Rencontrez votre âme sœur en toute discrétion",
    "✨ Des milliers de célibataires vous attendent",
    "🤫 Votre histoire commence ici, en toute simplicité",
    "💖 L'amour n'attend plus que vous",
    "🌟 Trouvez la personne qui vous correspond vraiment"
  ];

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Récupérer tous les posts
        const postsRes = await api.get('/posts');
        setPosts(postsRes || []);

        // 2. Récupérer tous les utilisateurs
        const usersRes = await api.get('/users/search?limit=100');
        setUsers(usersRes || []);
        
        // Créer une map pour un accès plus rapide
        const map = {};
        usersRes.forEach(u => {
          map[u.id] = u;
        });
        setUsersMap(map);

        // 3. Récupérer les likes pour chaque post
        const likesMap = {};
        for (const post of postsRes) {
          try {
            const likeRes = await api.get(`/likes/${post.id}`);
            likesMap[post.id] = likeRes;
          } catch (e) {
            likesMap[post.id] = { count: 0, users: [] };
          }
        }
        setLikes(likesMap);

        // 4. Récupérer les commentaires pour chaque post
        const commentsMap = {};
        for (const post of postsRes) {
          try {
            const commentRes = await api.get(`/comments/${post.id}`);
            commentsMap[post.id] = commentRes || [];
          } catch (e) {
            commentsMap[post.id] = [];
          }
        }
        setComments(commentsMap);
        
      } catch (error) {
        console.error("Erreur chargement feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleLike = async (postId) => {
    if (!currentUser) {
      alert("Veuillez vous connecter");
      router.push("/login");
      return;
    }

    try {
      const response = await api.post(`/likes/${postId}/toggle`, {});
      
      setLikes(prev => ({
        ...prev,
        [postId]: response
      }));
    } catch (error) {
      console.error("Erreur like:", error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!currentUser) {
      alert("Veuillez vous connecter");
      router.push("/login");
      return;
    }

    if (!newComment[postId]?.trim()) return;

    try {
      const response = await api.post(`/comments/${postId}`, {
        content: newComment[postId]
      });

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response]
      }));

      setNewComment(prev => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Erreur commentaire:", error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!currentUser || !confirm("Supprimer ce commentaire ?")) return;

    try {
      await api.delete(`/comments/${commentId}`);

      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== commentId)
      }));
    } catch (error) {
      console.error("Erreur suppression commentaire:", error);
    }
  };

  const handleMessage = (otherUser) => {
    if (!currentUser) {
      alert("Veuillez vous connecter");
      router.push("/login");
      return;
    }
    router.push(`/chat?userId=${otherUser.id}`);
  };

  const handleViewProfile = (userId) => {
    router.push(`/profile/${userId}`);
  };

  const getUserById = (userId) => {
    // Chercher d'abord dans la map
    if (usersMap[userId]) return usersMap[userId];
    
    // Sinon chercher dans le tableau
    const found = users.find(u => u.id === userId);
    if (found) return found;
    
    // Si toujours pas trouvé, retourner un objet avec les infos du post
    const post = posts.find(p => p.userId === userId);
    if (post) {
      return {
        id: userId,
        prenom: post.userName?.split(' ')[0] || 'Utilisateur',
        nom: post.userName?.split(' ')[1] || '',
        age: post.age,
        ville: post.ville,
        religion: post.religion,
        photo: post.userPhoto
      };
    }
    
    return null;
  };

  const getImageUrl = (photo) => {
    if (!photo) return "/default-avatar.png";
    if (photo.startsWith('http')) return photo;
    if (photo.startsWith('/uploads')) return `http://localhost:5000${photo}`;
    return `http://localhost:5000/uploads/${photo}`;
  };

  // Fonction pour afficher le nom avec "Vous" si c'est l'utilisateur connecté
  const displayName = (postUser) => {
    if (!postUser) return "Utilisateur inconnu";
    
    if (currentUser && postUser.id === currentUser.id) {
      return "Vous";
    }
    
    const prenom = postUser.prenom || "Prénom";
    const nom = postUser.nom || "Nom";
    return `${prenom} ${nom}`.trim();
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

      {!currentUser ? (
        <div className={styles.loginPrompt}>
          <p className={styles.welcomeTitle}>👋 Bienvenue sur RencontreAuthentique !</p>
          <p className={styles.welcomeMessage}>
            Découvrez les profils et publications des membres. Pour interagir 
            (liker, commenter, envoyer des messages privés), vous devez d'abord 
            créer un compte ou vous connecter.
          </p>
          <div className={styles.promptButtons}>
            <Link href="/login" className={styles.loginButton}>Se connecter</Link>
            <Link href="/register" className={styles.registerButton}>Créer un compte</Link>
          </div>
        </div>
      ) : (
        <div className={styles.connectedMessage}>
          <p>✅ Connecté en tant que {currentUser.prenom || ''} {currentUser.nom || ''}</p>
        </div>
      )}

      {posts.map((post) => {
        const postUser = getUserById(post.userId);
        const postLikes = likes[post.id] || { count: 0, users: [] };
        const postComments = comments[post.id] || [];
        const isOwnPost = currentUser && postUser?.id === currentUser.id;

        if (!postUser) return null;

        return (
          <div key={post.id} className={`${styles.postCard} ${isOwnPost ? styles.ownPost : ''}`}>
            <div className={styles.postHeader}>
              <Image 
                src={getImageUrl(postUser.photo)}
                alt={postUser.prenom || "utilisateur"}
                width={50}
                height={50}
                className={styles.postUserPhoto}
                unoptimized
                onError={(e) => e.target.src = "/default-avatar.png"}
              />
              <div className={styles.postHeaderInfo}>
                <strong>
                  {displayName(postUser)}
                  {isOwnPost && <span className={styles.youBadge}>(vous)</span>}
                </strong>
                <p className={styles.postInfo}>
                  Âge : {postUser.age || post.age || '?'} ans | {postUser.ville || post.ville || '?'} | {postUser.religion || post.religion || '?'}
                </p>
                <p className={styles.postDate}>
                  {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <p className={styles.postContent}>{post.content}</p>

            <div className={styles.postStats}>
              <span>{postLikes.count || 0} j'aime</span>
              <button 
                className={styles.commentsToggle} 
                onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
              >
                {postComments.length || 0} commentaires
              </button>
            </div>

            <div className={styles.postActions}>
              <button 
                className={styles.likeBtn} 
                onClick={() => handleLike(post.id)} 
                disabled={!currentUser}
              >
                {postLikes.users?.includes(currentUser?.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                {postLikes.count || 0}
              </button>
              <button 
                className={styles.commentBtn} 
                onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                disabled={!currentUser}
              >
                <CommentIcon /> Commenter
              </button>
              <button 
                className={styles.messageBtn} 
                onClick={() => handleMessage(postUser)} 
                disabled={!currentUser || isOwnPost}
              >
                <MessageIcon /> Message privé
              </button>
            </div>

            {showComments[post.id] && (
              <div className={styles.commentsSection}>
                <h4>Commentaires</h4>
                {postComments.map(comment => {
                  const isOwnComment = currentUser && comment.userId === currentUser.id;
                  return (
                    <div key={comment.id} className={`${styles.commentItem} ${isOwnComment ? styles.ownComment : ''}`}>
                      <Image 
                        src={getImageUrl(comment.photo)}
                        alt={comment.prenom || "utilisateur"}
                        width={30}
                        height={30}
                        className={styles.commentUserPhoto}
                        unoptimized
                        onError={(e) => e.target.src = "/default-avatar.png"}
                      />
                      <div className={styles.commentContent}>
                        <strong>
                          {isOwnComment ? "Vous" : `${comment.prenom || ''} ${comment.nom || ''}`}
                          {isOwnComment && <span className={styles.youBadge}>(vous)</span>}
                        </strong>
                        <p>{comment.content}</p>
                        <small>{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</small>
                      </div>
                      {isOwnComment && (
                        <button 
                          className={styles.deleteCommentBtn}
                          onClick={() => handleDeleteComment(post.id, comment.id)}
                        >
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
                      value={newComment[post.id] || ""}
                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && handleAddComment(post.id)}
                    />
                    <button 
                      onClick={() => handleAddComment(post.id)} 
                      disabled={!newComment[post.id]?.trim()}
                    >
                      <SendIcon />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {posts.length === 0 && (
        <div className={styles.noPosts}>
          <p>Aucune publication pour le moment</p>
        </div>
      )}
    </div>
  );
}