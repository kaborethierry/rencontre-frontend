import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "./profile.module.css";
import api from "../services/api";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SendIcon from "@mui/icons-material/Send";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

export default function Profile({ user: propUser, setUser: setPropUser }) {
  const router = useRouter();
  const [user, setUser] = useState(propUser);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPhoto, setShowPhoto] = useState(true);
  const [editedUser, setEditedUser] = useState({});
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get('/users/profile');
        console.log("✅ Profil chargé:", profileRes);
        
        setUser(profileRes);
        setEditedUser(profileRes);
        localStorage.setItem('user', JSON.stringify(profileRes));
        if (setPropUser) setPropUser(profileRes);
        
        const postsRes = await api.get(`/posts/user/${profileRes.id}`);
        setPosts(Array.isArray(postsRes) ? postsRes : []);
        
      } catch (error) {
        console.error("❌ Erreur chargement profil:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      const formData = new FormData();
      formData.append('nom', editedUser.nom || '');
      formData.append('prenom', editedUser.prenom || '');
      formData.append('age', editedUser.age || '');
      formData.append('ville', editedUser.ville || '');
      formData.append('profession', editedUser.profession || '');
      formData.append('religion', editedUser.religion || '');
      formData.append('description', editedUser.description || '');
      formData.append('sexe', editedUser.sexe || '');
      formData.append('statut', editedUser.statut || '');
      
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await api.put('/users/profile', formData);
      console.log("✅ Profil mis à jour:", response);
      
      setUser(response.user);
      setEditedUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      if (setPropUser) setPropUser(response.user);
      
      setIsEditing(false);
      setPhotoFile(null);
      setPhotoPreview("");
      setSuccess("✅ Profil mis à jour !");
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      console.error("❌ Erreur save profile:", err);
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La photo ne doit pas dépasser 5 Mo");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setPhotoFile(file);
    }
  };

  const handleAddPost = async () => {
    if (!newPost.trim()) return;

    try {
      const response = await api.post('/posts', { content: newPost });
      setPosts([response, ...posts]);
      setNewPost("");
      setSuccess("✅ Publication créée !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("❌ Erreur création post:", error);
      setError(error.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Supprimer cette publication ?")) return;
    
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
      setSuccess("✅ Publication supprimée !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("❌ Erreur suppression post:", error);
      setError(error.message);
    }
  };

  // Fonction pour supprimer le compte
  const handleDeleteAccount = async () => {
    if (deletingAccount) return;
    
    const confirmation = confirm(
      "⚠️ ATTENTION ⚠️\n\n" +
      "Voulez-vous vraiment supprimer définitivement votre compte ?\n\n" +
      "Cette action est IRRÉVERSIBLE et entraînera :\n" +
      "• La suppression de votre profil\n" +
      "• La suppression de toutes vos publications\n" +
      "• La suppression de tous vos commentaires\n" +
      "• La suppression de toutes vos conversations\n\n" +
      "Êtes-vous absolument sûr ?"
    );
    
    if (!confirmation) return;

    setDeletingAccount(true);
    setError("");
    
    try {
      // Appel API pour supprimer le compte
      await api.delete('/users/profile');
      
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Déconnecter l'utilisateur
      if (setPropUser) setPropUser(null);
      
      alert("✅ Votre compte a été supprimé avec succès.");
      
      // Rediriger vers la page d'accueil
      router.push("/");
      
    } catch (error) {
      console.error("❌ Erreur suppression compte:", error);
      setError(error.message || "Erreur lors de la suppression du compte");
      setDeletingAccount(false);
    }
  };

  // FONCTION CORRIGÉE POUR LES IMAGES - VERSION ULTIME
  const getImageUrl = () => {
    // 1. Prévisualisation (nouvelle photo)
    if (photoPreview) return photoPreview;
    
    // 2. Pas de photo
    if (!user?.photo) return "/default-avatar.png";
    
    // 3. Afficher l'URL complète pour debug
    console.log("📸 Photo originale:", user.photo);
    
    // 4. Construction de l'URL avec différentes possibilités
    const baseUrl = 'http://localhost:5000';
    
    // Si c'est déjà une URL complète
    if (user.photo.startsWith('http')) {
      return user.photo;
    }
    
    // Si le chemin commence par /uploads
    if (user.photo.startsWith('/uploads')) {
      return `${baseUrl}${user.photo}`;
    }
    
    // Si c'est juste le nom du fichier
    if (!user.photo.includes('/')) {
      return `${baseUrl}/uploads/profiles/${user.photo}`;
    }
    
    // Fallback
    return `${baseUrl}/uploads/profiles/${user.photo}`;
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.profileTitle}>Mon profil</h2>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      <div className={styles.profileCard}>
        <div className={styles.profilePhoto}>
          <div className={styles.photoWrapper}>
            <Image
              src={getImageUrl()}
              alt="photo de profil"
              width={200}
              height={200}
              className={`${styles.profileImage} ${!showPhoto ? styles.blur : ""}`}
              priority
              unoptimized // Force le chargement sans optimisation
              onError={(e) => {
                console.log("❌ Erreur chargement image:", e.target.src);
                e.target.src = "/default-avatar.png";
              }}
            />
          </div>
          
          {isEditing && (
            <div className={styles.photoUploadSection}>
              <label className={styles.photoLabel}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
                <span className={styles.photoButton}>
                  <PhotoCameraIcon /> Changer la photo
                </span>
              </label>
              {photoPreview && (
                <p className={styles.photoHint}>Nouvelle photo sélectionnée</p>
              )}
            </div>
          )}

          <button className={styles.togglePhoto} onClick={() => setShowPhoto(!showPhoto)}>
            {showPhoto ? <VisibilityOffIcon /> : <VisibilityIcon />}
            {showPhoto ? "Masquer la photo" : "Afficher la photo"}
          </button>
        </div>

        <div className={styles.profileInfo}>
          {isEditing ? (
            <>
              <input 
                value={editedUser.nom || ''} 
                onChange={(e) => setEditedUser({...editedUser, nom: e.target.value})} 
                placeholder="Nom" 
              />
              <input 
                value={editedUser.prenom || ''} 
                onChange={(e) => setEditedUser({...editedUser, prenom: e.target.value})} 
                placeholder="Prénom" 
              />
              <input 
                type="number" 
                value={editedUser.age || ''} 
                onChange={(e) => setEditedUser({...editedUser, age: e.target.value})} 
                placeholder="Âge" 
              />
              <input 
                value={editedUser.ville || ''} 
                onChange={(e) => setEditedUser({...editedUser, ville: e.target.value})} 
                placeholder="Ville" 
              />
              <input 
                value={editedUser.profession || ''} 
                onChange={(e) => setEditedUser({...editedUser, profession: e.target.value})} 
                placeholder="Profession" 
              />
              
              <select 
                value={editedUser.sexe || ''} 
                onChange={(e) => setEditedUser({...editedUser, sexe: e.target.value})}
              >
                <option value="">Sexe</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
                <option value="Autre">Autre</option>
              </select>
              
              <select 
                value={editedUser.religion || ''} 
                onChange={(e) => setEditedUser({...editedUser, religion: e.target.value})}
              >
                <option value="">Religion</option>
                <option value="Chrétien">Chrétien</option>
                <option value="Musulman">Musulman</option>
                <option value="Athée">Athée</option>
                <option value="Autre">Autre</option>
              </select>

              <select 
                value={editedUser.statut || ''} 
                onChange={(e) => setEditedUser({...editedUser, statut: e.target.value})}
              >
                <option value="">Statut</option>
                <option value="Célibataire">Célibataire</option>
                <option value="Divorcé(e)">Divorcé(e)</option>
                <option value="Veuf(ve)">Veuf(ve)</option>
              </select>

              <textarea 
                value={editedUser.description || ''} 
                onChange={(e) => setEditedUser({...editedUser, description: e.target.value})} 
                placeholder="Description" 
                rows="4" 
              />
              <input 
                type="email" 
                value={editedUser.email || ''} 
                onChange={(e) => setEditedUser({...editedUser, email: e.target.value})} 
                placeholder="Email" 
              />
              
              <div className={styles.editActions}>
                <button onClick={handleSaveProfile} className={styles.saveBtn} disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button onClick={() => {
                  setIsEditing(false);
                  setEditedUser(user);
                  setPhotoFile(null);
                  setPhotoPreview("");
                }} className={styles.cancelBtn}>
                  <CancelIcon /> Annuler
                </button>
              </div>
            </>
          ) : (
            <>
              <h3>{user?.prenom} {user?.nom}</h3>
              <p><strong>Âge :</strong> {user?.age} ans</p>
              <p><strong>Ville :</strong> {user?.ville}</p>
              <p><strong>Profession :</strong> {user?.profession}</p>
              <p><strong>Sexe :</strong> {user?.sexe || 'Non spécifié'}</p>
              <p><strong>Religion :</strong> {user?.religion}</p>
              <p><strong>Statut :</strong> {user?.statut || 'Non spécifié'}</p>
              <p><strong>Description :</strong> {user?.description || 'Aucune description'}</p>
              <p><strong>Email :</strong> {user?.email}</p>
              <p><strong>Inscrit le :</strong> {user?.registeredAt ? new Date(user.registeredAt).toLocaleDateString('fr-FR') : ''}</p>
            </>
          )}

          <div className={styles.profileButtons}>
            {!isEditing && (
              <>
                <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                  <EditIcon /> Modifier le profil
                </button>
                <button 
                  className={styles.deleteAccountBtn} 
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                >
                  <DeleteIcon /> {deletingAccount ? 'Suppression...' : 'Supprimer le compte'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.postSection}>
        <h3>Publier quelque chose</h3>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          rows="4"
          placeholder="Écrivez votre message..."
        />
        <button onClick={handleAddPost} disabled={!newPost.trim() || loading}>
          <SendIcon /> Publier
        </button>
      </div>

      <div className={styles.feed}>
        <h3>Mes publications ({posts.length})</h3>
        {posts.map((post) => (
          <div key={post.id} className={styles.postCard}>
            <div className={styles.postHeader}>
              <Image 
                src={getImageUrl()}
                alt={user?.prenom}
                width={50} 
                height={50} 
                className={styles.postUserPhoto}
                unoptimized
                onError={(e) => e.target.src = "/default-avatar.png"}
              />
              <div>
                <strong>{user?.prenom} {user?.nom}</strong>
                <p className={styles.postInfo}>
                  Âge : {user?.age} ans | {user?.ville} | {user?.religion}
                </p>
                <p className={styles.postDate}>
                  {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <p className={styles.postContent}>{post.content}</p>

            <div className={styles.postActions}>
              <button className={styles.deletePostBtn} onClick={() => handleDeletePost(post.id)}>
                <DeleteIcon /> Supprimer
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <p className={styles.noPosts}>Aucune publication pour le moment</p>
        )}
      </div>
    </div>
  );
}