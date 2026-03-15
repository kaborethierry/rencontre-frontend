import React from "react";
import styles from "./About.module.css";

import SecurityIcon from "@mui/icons-material/Security";
import FlagIcon from "@mui/icons-material/Flag";
import GroupIcon from "@mui/icons-material/Group";

export default function AboutPage() {
  return (
    <section className={styles.about}>
      <div className={styles.container}>

        {/* IMAGE AVEC CŒURS QUI TOURNENT AUTOUR */}
        <div className={styles.imageBox}>
          <div className={styles.imageWrapper}>
            <img src="/about.jpg" alt="Rencontre sérieuse" />
            <div className={styles.heartsOrbit}>
              <div className={`${styles.heart} ${styles.heart1}`}>❤️</div>
              <div className={`${styles.heart} ${styles.heart2}`}>❤️</div>
              <div className={`${styles.heart} ${styles.heart3}`}>❤️</div>
              <div className={`${styles.heart} ${styles.heart4}`}>❤️</div>
              <div className={`${styles.heart} ${styles.heart5}`}>❤️</div>
              <div className={`${styles.heart} ${styles.heart6}`}>❤️</div>
              <div className={`${styles.heart} ${styles.heart7}`}>❤️</div>
              <div className={`${styles.heart} ${styles.heart8}`}>❤️</div>
            </div>
          </div>
        </div>

        {/* TEXTE */}
        <div className={styles.content}>
          <h2 className={styles.title}>À propos de Rencontre Authentique</h2>

          <p className={`${styles.text} ${styles.animate}`}>
            <strong>Rencontre Authentique</strong> est une plateforme de mise en relation
            dédiée aux personnes qui recherchent une relation stable, sincère et durable,
            pouvant aboutir au mariage.
          </p>

          <p className={`${styles.text} ${styles.animateDelay}`}>
            Notre objectif est de créer un espace sécurisé, respectueux et authentique
            où hommes et femmes peuvent se rencontrer avec des intentions claires et sérieuses.
          </p>

          {/* OBJECTIF */}
          <div className={`${styles.objectives} ${styles.glow}`}>
            <h3 className={styles.iconTitle}>
              <FlagIcon className={styles.icon} />
              Objectif principal
            </h3>
            <p>Faciliter des relations sérieuses et durables.</p>
          </div>

          {/* PUBLIC CIBLE */}
          <div className={`${styles.targets} ${styles.glowPink}`}>
            <h3 className={styles.iconTitle}>
              <GroupIcon className={styles.icon} />
              Public cible
            </h3>
            <ul>
              <li>Femmes : 18 ans et plus</li>
              <li>Hommes : 25 et plus</li>
              <li>Afrique et diaspora</li>
            </ul>
          </div>

          {/* SÉCURITÉ */}
          <div className={`${styles.security} ${styles.glowBlue}`}>
            <h3 className={styles.iconTitle}>
              <SecurityIcon className={styles.icon} />
              Valeurs de la plateforme
            </h3>
            <p>Sécurité, respect, confidentialité et authenticité.</p>
          </div>

        </div>
      </div>
    </section>
  );
}