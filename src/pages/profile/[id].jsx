import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "../profile.module.css";  // ✅ CORRIGÉ : remonte d'un dossier
import api from "../../services/api";

import MessageIcon from "@mui/icons-material/Message";
import ReportIcon from "@mui/icons-material/Report";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function PublicProfile({ user }) {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPhoto, setShowPhoto] = useState(false);
  const [imageError, setImageError] = useState(false);

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
    
    if (!photo || imageError) return "/default-avatar.png";
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    if (photo.startsWith('/uploads')) return `${baseUrl}${photo}`;
    return `${baseUrl}/uploads/profiles/${photo}`;
  };

  useEffect(() => {
    if (!id) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get(`/users/${id}`);
        setProfile(profileRes);
        
        const postsRes = await api.get(`/posts/user/${id}`);
        setPosts(postsRes || []);
      } catch (error) {
        console.error("❌ Erreur chargement profil:", error);
        setError(error.message || "Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  const handleMessage = () => {
    if (!user) {
      alert("Veuillez vous connecter pour envoyer un message");
      router.push("/login");
      return;
    }
    router.push(`/chat?userId=${id}`);
  };

  const handleReport = () => {
    if (!user) {
      alert("Veuillez vous connecter pour signaler un utilisateur");
      router.push("/login");
      return;
    }
    
    const reason = prompt("Raison du signalement :");
    if (reason) {
      api.post('/reports', { reportedUserId: id, reason })
        .then(() => alert("✅ Signalement envoyé"))
        .catch(() => alert("❌ Erreur"));
    }
  };

  if (loading) return <div className={styles.loading}>Chargement...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!profile) return <div className={styles.error}>Profil non trouvé</div>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.profilePhoto}>
          <div className={styles.photoWrapper}>
            <Image
              src={getImageUrl(profile.photo)}
              alt={profile.prenom}
              width={200}
              height={200}
              className={`${styles.profileImage} ${!showPhoto ? styles.blur : ""}`}
              unoptimized
              onError={() => setImageError(true)}
            />
          </div>
          <button className={styles.togglePhoto} onClick={() => setShowPhoto(!showPhoto)}>
            {showPhoto ? <VisibilityOffIcon /> : <VisibilityIcon />}
            {showPhoto ? "Masquer" : "Afficher"} la photo
          </button>
        </div>
        <div className={styles.profileInfo}>
          <h3>{profile.prenom} {profile.nom}</h3>
          <p><strong>Âge :</strong> {profile.age} ans</p>
          <p><strong>Ville :</strong> {profile.ville}</p>
          <p><strong>Profession :</strong> {profile.profession || "Non spécifiée"}</p>
          <p><strong>Religion :</strong> {profile.religion}</p>
          <p><strong>Statut :</strong> {profile.statut || "Célibataire"}</p>
          <p><strong>Description :</strong> {profile.description || "Aucune description"}</p>
          
          <div className={styles.profileButtons}>
            <button onClick={handleMessage} className={styles.messageBtn}>
              <MessageIcon /> Message
            </button>
            <button onClick={handleReport} className={styles.reportBtn}>
              <ReportIcon /> Signaler
            </button>
          </div>
        </div>
      </div>

      <div className={styles.postsSection}>
        <h3>Publications de {profile.prenom}</h3>
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className={styles.postCard}>
              <p className={styles.postContent}>{post.content}</p>
              <small className={styles.postDate}>
                {new Date(post.createdAt).toLocaleDateString('fr-FR')}
              </small>
            </div>
          ))
        ) : (
          <p className={styles.noPosts}>Aucune publication</p>
        )}
      </div>
    </div>
  );
}