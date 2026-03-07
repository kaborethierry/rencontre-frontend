import React, { useState } from "react";
import styles from "./adminlogin.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import api from "../services/api";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";

export default function AdminLogin({ setUser }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Vérifier si l'utilisateur est admin
      if (response.user.role !== 'admin') {
        setError("Accès non autorisé. Compte admin requis.");
        setLoading(false);
        return;
      }

      // Stocker le token et l'utilisateur
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Mettre à jour l'état user dans _app.jsx
      if (setUser) {
        setUser(response.user);
      }
      
      setMessage("Connexion admin réussie !");

      // Rediriger vers le dashboard admin
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
      
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminLoginContainer}>
      <div className={styles.adminLoginCard}>
        <div className={styles.adminHeader}>
          <AdminPanelSettingsIcon className={styles.adminIcon} />
          <h2>Administration</h2>
          <p className={styles.adminSubtitle}>Connectez-vous pour gérer la plateforme</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.success}>{message}</p>}

        <form onSubmit={handleLogin} className={styles.adminForm}>
          <div className={styles.inputGroup}>
            <label>
              <PersonIcon className={styles.inputIcon} />
              Email admin
            </label>
            <input 
              type="email" 
              placeholder="admin@exemple.com" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
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
                placeholder="••••••••" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
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
          
          <button 
            type="submit" 
            disabled={loading}
            className={`${styles.adminButton} ${loading ? styles.loading : ''}`}
          >
            {loading ? 'Connexion...' : 'Accéder au dashboard'}
          </button>
        </form>

        <div className={styles.adminFooter}>
          <p>Pas encore de compte admin ?</p>
          <Link href="/adminregister" className={styles.registerLink}>
            Créer un compte
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