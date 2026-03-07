import React, { useState } from "react";
import styles from "./login.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import api from "../services/api";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function LoginPage({ setUser }) {
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
      
      // Stocker le token et l'utilisateur
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Mettre à jour l'état user dans _app.jsx
      if (setUser) {
        setUser(response.user);
      }
      
      setMessage("Connexion réussie !");

      // Rediriger vers le profil après connexion
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
      
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Connexion</h2>

      {error && <p className={styles.error}>{error}</p>}
      {message && <p className={styles.success}>{message}</p>}

      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={loading}
          className={styles.inputField}
        />
        
        {/* Champ Mot de passe avec bouton intégré */}
        <div className={styles.passwordWrapper}>
          <input 
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe" 
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
        
        <button 
          type="submit" 
          disabled={loading}
          className={loading ? styles.loading : ''}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <Link href="/register" className={styles.registerLink}>
        Pas encore de compte ? S'inscrire
      </Link>

      <Link href="/forgot-password" className={styles.forgot}>
        Mot de passe oublié ?
      </Link>
    </div>
  );
}