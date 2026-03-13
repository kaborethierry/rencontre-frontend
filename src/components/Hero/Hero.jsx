import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

import FavoriteIcon from "@mui/icons-material/Favorite";

export default function Hero() {
  const [hearts, setHearts] = useState([]);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "🌟 Plateforme numéro 1 au Burkina Faso",
    "💖 Rencontres authentiques et discrètes",
    "🤝 Des milliers de célibataires vous attendent",
    "✨ Trouvez l'amour en toute simplicité",
    "💕 Rejoignez la communauté"
  ];

  useEffect(() => {
    // Animation des coeurs
    const createHeart = () => {
      const heart = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        size: Math.random() * 20 + 15,
        duration: Math.random() * 3 + 3,
        delay: Math.random() * 2,
        color: Math.random() > 0.33 ? (Math.random() > 0.5 ? '#FF69B4' : '#FF0000') : '#4169E1',
        rotation: Math.random() * 360,
        xOffset: (Math.random() - 0.5) * 200,
      };
      setHearts(prev => [...prev, heart]);

      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== heart.id));
      }, heart.duration * 1000);
    };

    const interval = setInterval(createHeart, 300);

    // Message défilant
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <section className={styles.hero}>
      {/* Image de fond */}
      <div className={styles.heroBackground}></div>
      
      {/* Overlay */}
      <div className={styles.heroOverlay}></div>

      {/* Message défilant */}
      <div className={styles.scrollingMessage}>
        <div className={styles.messageContent}>
          <span className={styles.messageText} key={messageIndex}>
            {messages[messageIndex]}
          </span>
        </div>
      </div>

      {/* Coeurs animés */}
      <div className={styles.heartsContainer}>
        {hearts.map(heart => (
          <div
            key={heart.id}
            className={styles.heart}
            style={{
              left: `${heart.left}%`,
              fontSize: `${heart.size}px`,
              animationDuration: `${heart.duration}s`,
              animationDelay: `${heart.delay}s`,
              color: heart.color,
              transform: `rotate(${heart.rotation}deg)`,
              '--x-offset': `${heart.xOffset}px`,
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      <div className={styles.heroContent}>
        <h1 className={styles.title}>
          Trouvez l'amour 
          <span className={styles.titleHighlight}> authentique</span>
        </h1>

        <p className={styles.subtitle}>
          Une plateforme sérieuse basée sur le respect, la confidentialité et l'authenticité.
        </p>

        <div className={styles.ctaGroup}>
          <Link href="/register" className={styles.btnPrimary}>
            <FavoriteIcon /> S'inscrire
          </Link>

          <Link href="/feed" className={styles.btnSecondary}>
            Rencontre
          </Link>
        </div>

        <div className={styles.floatingHearts}>
          <span className={styles.floatingHeart}>❤️</span>
          <span className={styles.floatingHeart}>💖</span>
          <span className={styles.floatingHeart}>💕</span>
          <span className={styles.floatingHeart}>💗</span>
          <span className={styles.floatingHeart}>💓</span>
        </div>
      </div>
    </section>
  );
}