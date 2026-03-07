import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import styles from "./register.module.css";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import api from "../services/api";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    age: "",
    ville: "",
    profession: "",
    religion: "",
    description: "",
    sexe: "",
    statut: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  
  // États pour la visibilité des mots de passe
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photoFile) {
      setError("Veuillez ajouter une photo de profil");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('prenom', formData.prenom);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('ville', formData.ville);
      formDataToSend.append('profession', formData.profession);
      formDataToSend.append('religion', formData.religion);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('sexe', formData.sexe);
      formDataToSend.append('statut', formData.statut);
      formDataToSend.append('photo', photoFile);

      await api.post('/auth/register', formDataToSend);
      
      alert("✅ Inscription réussie ! Veuillez vous connecter.");
      router.push("/login");
      
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2>Inscription</h2>
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={handleSubmit} className={styles.registerForm}>
        <div className={styles.photoSection}>
          <div className={styles.photoPreview}>
            {photoPreview ? (
              <Image 
                src={photoPreview} 
                alt="Aperçu" 
                width={120} 
                height={120} 
                className={styles.previewImage}
              />
            ) : (
              <div className={styles.photoPlaceholder}>
                <PhotoCameraIcon style={{ fontSize: 40 }} />
                <p>Photo de profil</p>
              </div>
            )}
          </div>
          
          <label className={styles.photoLabel}>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
              required
            />
            <span className={styles.photoButton}>
              <PhotoCameraIcon /> Choisir une photo
            </span>
          </label>
        </div>

        <input 
          type="text" 
          name="nom" 
          placeholder="Nom" 
          value={formData.nom}
          onChange={handleChange} 
          required 
        />
        
        <input 
          type="text" 
          name="prenom" 
          placeholder="Prénom" 
          value={formData.prenom}
          onChange={handleChange} 
          required 
        />
        
        <input 
          type="number" 
          name="age" 
          placeholder="Âge" 
          min="18" 
          max="100" 
          value={formData.age}
          onChange={handleChange} 
          required 
        />
        
        <input 
          type="text" 
          name="ville" 
          placeholder="Ville" 
          value={formData.ville}
          onChange={handleChange} 
          required 
        />
        
        <input 
          type="text" 
          name="profession" 
          placeholder="Profession" 
          value={formData.profession}
          onChange={handleChange} 
          required 
        />
        
        <select 
          name="sexe" 
          value={formData.sexe}
          onChange={handleChange} 
          required
        >
          <option value="">Sélectionnez votre sexe</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
          <option value="Autre">Autre</option>
        </select>
        
        <select 
          name="religion" 
          value={formData.religion}
          onChange={handleChange} 
          required
        >
          <option value="">Sélectionnez votre religion</option>
          <option value="Chrétien">Chrétien</option>
          <option value="Musulman">Musulman</option>
          <option value="Athée">Athée</option>
          <option value="Autre">Autre</option>
        </select>

        <select 
          name="statut" 
          value={formData.statut}
          onChange={handleChange} 
          required
        >
          <option value="">Sélectionnez votre statut</option>
          <option value="Célibataire">Célibataire</option>
          <option value="Divorcé(e)">Divorcé(e)</option>
          <option value="Veuf(ve)">Veuf(ve)</option>
        </select>

        <textarea 
          name="description" 
          placeholder="Description (parlez de vous...)" 
          value={formData.description}
          onChange={handleChange} 
          required 
          rows="4" 
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange} 
          required 
        />
        
        {/* Champ Mot de passe avec bouton intégré */}
        <div className={styles.passwordWrapper}>
          <input 
            type={showPassword ? "text" : "password"}
            name="password" 
            placeholder="Mot de passe (min. 6 caractères)" 
            value={formData.password}
            onChange={handleChange} 
            required 
            className={styles.passwordInput}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
        </div>
        
        {/* Champ Confirmation avec bouton intégré */}
        <div className={styles.passwordWrapper}>
          <input 
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword" 
            placeholder="Confirmer le mot de passe" 
            value={formData.confirmPassword}
            onChange={handleChange} 
            required 
            className={styles.passwordInput}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className={loading ? styles.loading : ''}
        >
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>

      <p className={styles.loginLink}>
        Déjà un compte ? <Link href="/login">Se connecter</Link>
      </p>
    </div>
  );
}