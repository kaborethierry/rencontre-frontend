import React from "react";
import Link from "next/link";
import styles from "./legal.module.css";
import CookieIcon from "@mui/icons-material/Cookie";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import SecurityIcon from "@mui/icons-material/Security";

export default function Cookies() {
  return (
    <div className={styles.legalContainer}>
      <div className={styles.legalHeader}>
        <CookieIcon className={styles.legalIcon} />
        <h1>Politique des cookies</h1>
        <p className={styles.lastUpdate}>Dernière mise à jour : 6 mars 2026</p>
      </div>

      <div className={styles.legalContent}>
        <section className={styles.legalSection}>
          <h2>Qu'est-ce qu'un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, 
            tablette, smartphone) lorsque vous visitez un site web. Les cookies permettent 
            au site de reconnaître votre appareil et de mémoriser vos préférences pour 
            améliorer votre expérience de navigation.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Types de cookies utilisés</h2>
          
          <div className={styles.cookieType}>
            <h3>
              <InfoIcon className={styles.cookieIcon} />
              Cookies essentiels
            </h3>
            <p>
              Nécessaires au fonctionnement du site, ils vous permettent de vous connecter, 
              de naviguer et d'utiliser les fonctionnalités de base. Sans ces cookies, 
              certaines parties du site ne pourraient pas fonctionner correctement.
            </p>
            <ul className={styles.legalList}>
              <li>✓ Maintien de la connexion</li>
              <li>✓ Sécurité du compte</li>
              <li>✓ Gestion de la session</li>
            </ul>
          </div>

          <div className={styles.cookieType}>
            <h3>
              <SettingsIcon className={styles.cookieIcon} />
              Cookies de préférences
            </h3>
            <p>
              Ils mémorisent vos choix et préférences pour personnaliser votre expérience.
            </p>
            <ul className={styles.legalList}>
              <li>✓ Langue préférée</li>
              <li>✓ Paramètres d'affichage</li>
              <li>✓ Préférences de recherche</li>
            </ul>
          </div>

          <div className={styles.cookieType}>
            <h3>
              <SecurityIcon className={styles.cookieIcon} />
              Cookies de sécurité
            </h3>
            <p>
              Ils contribuent à la sécurité de votre compte et à la détection des activités 
              suspectes.
            </p>
            <ul className={styles.legalList}>
              <li>✓ Authentification</li>
              <li>✓ Détection des fraudes</li>
              <li>✓ Protection contre les attaques</li>
            </ul>
          </div>
        </section>

        <section className={styles.legalSection}>
          <h2>Cookies tiers</h2>
          <p>
            Certains cookies sont placés par des services tiers que nous utilisons pour 
            améliorer notre plateforme :
          </p>
          <ul className={styles.legalList}>
            <li>✓ Google Analytics (analyse d'audience)</li>
            <li>✓ Réseaux sociaux (boutons de partage)</li>
          </ul>
          <p className={styles.note}>
            Ces tiers ont leurs propres politiques de confidentialité et de cookies.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Gestion des cookies</h2>
          <p>
            Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez. 
            Vous pouvez supprimer tous les cookies déjà présents sur votre appareil et 
            configurer la plupart des navigateurs pour les bloquer.
          </p>
          
          <h3>Configuration par navigateur :</h3>
          <ul className={styles.browserList}>
            <li>
              <strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies
            </li>
            <li>
              <strong>Firefox :</strong> Options → Vie privée et sécurité → Cookies
            </li>
            <li>
              <strong>Safari :</strong> Préférences → Confidentialité → Cookies
            </li>
            <li>
              <strong>Edge :</strong> Paramètres → Cookies et autorisations
            </li>
          </ul>
          
          <p className={styles.warning}>
            ⚠️ Le blocage des cookies peut affecter certaines fonctionnalités de notre site.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>Durée de conservation</h2>
          <p>
            Les cookies ont des durées de vie variables :
          </p>
          <ul className={styles.legalList}>
            <li>✓ Cookies de session : supprimés à la fermeture du navigateur</li>
            <li>✓ Cookies persistants : conservés jusqu'à 12 mois maximum</li>
          </ul>
        </section>

        <section className={styles.legalSection}>
          <h2>Contact</h2>
          <p>Pour toute question concernant notre utilisation des cookies :</p>
          <div className={styles.contactBox}>
            <p><strong>Email :</strong> rencontreserieuse558@gmail.com</p>
          </div>
        </section>

        <div className={styles.backLink}>
          <Link href="/">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}