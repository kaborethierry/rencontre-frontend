import React, { useState } from "react";
import styles from "./adminregister.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import api from "../services/api";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

export default function AdminRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      // 1. Créer le compte utilisateur normal
      const adminData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        age: 25,
        ville: "Admin",
        profession: "Administrateur",
        religion: "Autre",
        description: "Compte administrateur",
        sexe: "Autre",
        statut: "Célibataire"
      };

      // ✅ CORRECTION 1: Utiliser api au lieu de fetch
      const response = await api.post('/auth/register', adminData);
      
      // 2. Mettre à jour le rôle en admin
      const token = response.token;
      
      // ✅ CORRECTION 2: Utiliser api pour la mise à jour du rôle
      const roleResponse = await api.put('/users/profile', { role: 'admin' });

      if (!roleResponse) {
        throw new Error("Erreur lors de la mise à jour du rôle");
      }

      setMessage("✅ Compte admin créé avec succès ! Vous pouvez maintenant vous connecter.");
      
      setTimeout(() => {
        router.push("/adminlogin");
      }, 2000);
      
    } catch (err) {
      console.error("❌ Erreur inscription:", err);
      setError(err.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminRegisterContainer}>
      <div className={styles.adminRegisterCard}>
        <div className={styles.adminHeader}>
          <AdminPanelSettingsIcon className={styles.adminIcon} />
          <h2>Créer un compte admin</h2>
          <p className={styles.adminSubtitle}>Inscrivez-vous pour gérer la plateforme</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.success}>{message}</p>}

        <form onSubmit={handleSubmit} className={styles.adminForm}>
          <div className={styles.inputGroup}>
            <label>
              <PersonIcon className={styles.inputIcon} />
              Nom
            </label>
            <input 
              type="text" 
              name="nom"
              placeholder="Votre nom" 
              required 
              value={formData.nom}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>
              <PersonIcon className={styles.inputIcon} />
              Prénom
            </label>
            <input 
              type="text" 
              name="prenom"
              placeholder="Votre prénom" 
              required 
              value={formData.prenom}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>
              <EmailIcon className={styles.inputIcon} />
              Email
            </label>
            <input 
              type="email" 
              name="email"
              placeholder="admin@exemple.com" 
              required 
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>
              <LockIcon className={styles.inputIcon} />
              Mot de passe
            </label>
            <div className={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••" 
                required 
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className={styles.passwordInput}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>
              <LockIcon className={styles.inputIcon} />
              Confirmer le mot de passe
            </label>
            <div className={styles.passwordWrapper}>
              <input 
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••" 
                required 
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className={styles.passwordInput}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`${styles.adminButton} ${loading ? styles.loading : ''}`}
          >
            {loading ? 'Création du compte...' : 'Créer un compte admin'}
          </button>
        </form>

        <div className={styles.adminFooter}>
          <p>Déjà un compte admin ?</p>
          <Link href="/adminlogin" className={styles.loginLink}>
            Se connecter
          </Link>
        </div>

        <div className={styles.backToSite}>
          <Link href="/" className={styles.backLink}>
            ← Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}