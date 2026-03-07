import React from "react";
import styles from "./About.module.css";

export default function About() {
  return (
    <section className={styles.about}>
      <div className={styles.container}>

        <div className={styles.content}>
          <h2 className={styles.title}>À propos de Rencontre Sérieuse</h2>

          <p className={styles.text}>
            <strong>Rencontre Sérieuse</strong> est une plateforme de mise en relation
            dédiée aux personnes qui recherchent une relation stable, sincère et durable,
            pouvant aboutir au mariage.
          </p>

          <p className={styles.text}>
            Notre objectif est de créer un espace sécurisé, respectueux et authentique
            où hommes et femmes peuvent se rencontrer avec des intentions claires et sérieuses.
          </p>

          <div className={styles.objectives}>
            <h3>🎯 Objectif principal</h3>
            <p>Faciliter des relations sérieuses et durables.</p>
          </div>

          <div className={styles.targets}>
            <h3>👥 Public cible</h3>
            <ul>
              <li>Femmes : 18 ans et plus</li>
              <li>Hommes : 25 à 50 ans</li>
              <li>Afrique et diaspora</li>
            </ul>
          </div>
        </div>

        <div className={styles.imageBox}>
          <img src="/about.jpg" alt="Rencontre sérieuse" />
        </div>

      </div>
    </section>
  );
}