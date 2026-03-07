import React, { useEffect, useState } from "react";
import styles from "./Loader.module.css";

export default function Loader({ onComplete }) {
  const slogan = "L'amour commence ici";
  const [text, setText] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [glowingHearts, setGlowingHearts] = useState([]);

  // Couleurs pour chaque lettre
  const colors = [
    '#FFD700', // Or
    '#FF69B4', // Rose
    '#4169E1', // Bleu royal
    '#32CD32', // Vert lime
    '#FF4500', // Rouge orangé
    '#9370DB', // Violet moyen
    '#00CED1', // Turquoise
    '#FF1493', // Rose profond
  ];

  useEffect(() => {
    let i = 0;

    const typing = setInterval(() => {
      setText(slogan.slice(0, i + 1));
      i++;
      if (i === slogan.length) clearInterval(typing);
    }, 120);

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 3000);

    // Créer des petites particules de coeur autour
    const createGlowingHeart = () => {
      const heart = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 20 + 10,
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      setGlowingHearts(prev => [...prev, heart]);

      setTimeout(() => {
        setGlowingHearts(prev => prev.filter(h => h.id !== heart.id));
      }, 3000);
    };

    const heartInterval = setInterval(createGlowingHeart, 200);

    return () => {
      clearInterval(typing);
      clearTimeout(timer);
      clearInterval(heartInterval);
    };
  }, []);

  // Fonction pour colorer chaque lettre
  const renderColoredText = () => {
    return text.split('').map((char, index) => (
      <span
        key={index}
        className={styles.coloredChar}
        style={{
          color: colors[index % colors.length],
          animation: `${styles.charPop} 0.3s ease ${index * 0.1}s`,
          display: 'inline-block',
        }}
      >
        {char}
      </span>
    ));
  };

  return (
    <div className={`${styles.loader} ${!isVisible ? styles.hide : ""}`}>
      {/* Particules de coeur */}
      <div className={styles.glowingHearts}>
        {glowingHearts.map(heart => (
          <div
            key={heart.id}
            className={styles.glowingHeart}
            style={{
              left: `${heart.left}%`,
              top: `${heart.top}%`,
              fontSize: `${heart.size}px`,
              color: heart.color,
              animationDelay: `${heart.delay}s`,
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      <div className={styles.heartContainer}>
        {/* Grand coeur principal */}
        <svg viewBox="0 0 120 120" className={styles.heart}>
          <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF69B4">
                <animate
                  attributeName="stop-color"
                  values="#FF69B4; #FF1493; #FF69B4"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="#FF1493">
                <animate
                  attributeName="stop-color"
                  values="#FF1493; #FF69B4; #FF1493"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#FF69B4">
                <animate
                  attributeName="stop-color"
                  values="#FF69B4; #FF1493; #FF69B4"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Ombre du coeur */}
          <path
            d="M60 100 L20 60 A20 20 0 1 1 60 30 A20 20 0 1 1 100 60 Z"
            fill="rgba(255,105,180,0.2)"
            filter="url(#glow)"
            transform="translate(2,2)"
          />
          
          {/* Coeur principal */}
          <path
            d="M60 100 L20 60 A20 20 0 1 1 60 30 A20 20 0 1 1 100 60 Z"
            fill="url(#heartGradient)"
            stroke="white"
            strokeWidth="2"
            filter="url(#glow)"
            className={styles.heartPath}
          >
            <animate
              attributeName="d"
              values="M60 100 L20 60 A20 20 0 1 1 60 30 A20 20 0 1 1 100 60 Z;
                      M60 105 L18 58 A22 22 0 1 1 60 28 A22 22 0 1 1 102 58 Z;
                      M60 100 L20 60 A20 20 0 1 1 60 30 A20 20 0 1 1 100 60 Z"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        {/* Logo au centre */}
        <img src="/logo.png" alt="Logo" className={styles.logo} />

        {/* Petits coeurs orbitaux */}
        <div className={styles.orbitingHearts}>
          <div className={styles.orbitHeart1}>❤️</div>
          <div className={styles.orbitHeart2}>💖</div>
          <div className={styles.orbitHeart3}>💗</div>
          <div className={styles.orbitHeart4}>💕</div>
        </div>
      </div>

      <h2 className={styles.slogan}>
        {renderColoredText()}
        <span className={styles.cursor}>|</span>
      </h2>

      <div className={styles.progressBar}>
        <div className={styles.progress}>
          <div className={styles.progressGlow}></div>
        </div>
      </div>

      <div className={styles.floatingHearts}>
        <span className={styles.floatHeart1}>❤️</span>
        <span className={styles.floatHeart2}>💖</span>
        <span className={styles.floatHeart3}>💕</span>
        <span className={styles.floatHeart4}>💗</span>
      </div>
    </div>
  );
}