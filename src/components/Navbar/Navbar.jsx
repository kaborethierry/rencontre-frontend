import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./Navbar.module.css";
import api from "../../services/api";
import socketService from "../../services/socket";

// Icônes Material-UI
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import MessageIcon from "@mui/icons-material/Message";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";

// Icônes pour l'amour et les rencontres
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import WcIcon from "@mui/icons-material/Wc";

export default function Navbar({ user, setUser }) {
  const [open, setOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      
      try {
        socketService.connect();
        
        socketService.onNewMessage(() => {
          loadUnreadCount();
        });

      } catch (error) {
        console.error("Erreur connexion socket:", error);
      }
    }

    return () => {
      try {
        socketService.disconnect();
      } catch (error) {
        console.error("Erreur déconnexion socket:", error);
      }
    };
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      // ✅ SUPPRIMER L'APPEL À /notifications/unread-count
      const messagesRes = await api.get('/messages/unread-count').catch(() => ({ count: 0 }));
      
      setUnreadMessages(messagesRes.count || 0);
    } catch (error) {
      console.error("Erreur chargement compteurs:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    try {
      socketService.disconnect();
    } catch (error) {
      console.error("Erreur déconnexion socket:", error);
    }
    router.push("/");
  };

  const closeMenu = () => setOpen(false);

  // Choisir une icône aléatoire pour l'amour
  const loveIcons = [
    <FavoriteIcon key="fav" />,
    <FavoriteBorderIcon key="favborder" />,
    <MaleIcon key="male" />,
    <FemaleIcon key="female" />,
    <Diversity3Icon key="diversity" />,
    <EmojiPeopleIcon key="emoji" />,
    <WcIcon key="wc" />
  ];
  
  const loveIcon = loveIcons[new Date().getHours() % loveIcons.length];

  return (
    <header className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          💕 RencontreAuthentique
        </Link>

        <button className={styles.burger} onClick={() => setOpen(!open)}>
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav className={`${styles.navLinks} ${open ? styles.open : ""}`}>
          <Link href="/" className={styles.link} onClick={closeMenu}>
            <HomeIcon /> Accueil
          </Link>
          <Link href="/about" className={styles.link} onClick={closeMenu}>
            <InfoIcon /> À propos
          </Link>
          <Link href="/feed" className={styles.link} onClick={closeMenu}>
            {loveIcon} Rencontre
          </Link>
          <Link href="/contact" className={styles.link} onClick={closeMenu}>
            <ContactMailIcon /> Contact
          </Link>

          {!user ? (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.btnLogin} onClick={closeMenu}>
                <LoginIcon /> Connexion
              </Link>
              <Link href="/register" className={styles.btnRegister} onClick={closeMenu}>
                <AppRegistrationIcon /> Inscription
              </Link>
            </div>
          ) : (
            <div className={styles.userButtons}>
              <Link href="/profile" className={styles.link} onClick={closeMenu}>
                <PersonIcon /> Mon profil
              </Link>
              <Link href="/messages" className={styles.messageLink} onClick={closeMenu}>
                <MessageIcon /> Messages
                {unreadMessages > 0 && (
                  <span className={styles.badge}>{unreadMessages}</span>
                )}
              </Link>
              <button onClick={() => { handleLogout(); closeMenu(); }} className={styles.btnLogout}>
                <LogoutIcon /> Déconnexion
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}