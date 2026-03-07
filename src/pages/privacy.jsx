import React from "react";
import Link from "next/link";
import styles from "./legal.module.css";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import SecurityIcon from "@mui/icons-material/Security";
import LockIcon from "@mui/icons-material/Lock";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export default function Privacy() {
  return (
    <div className={styles.legalContainer}>
      <div className={styles.legalHeader}>
        <PrivacyTipIcon className={styles.legalIcon} />
        <h1>Politique de confidentialité</h1>
        <p className={styles.lastUpdate}>Dernière mise à jour : 6 mars 2026</p>
      </div>

      <div className={styles.legalContent}>
        <section className={styles.legalSection}>
          <h2>1. Introduction</h2>
          <p>
            Chez RencontreAuthentique, nous accordons une importance primordiale à la 
            protection de vos données personnelles. Cette politique de confidentialité 
            explique comment nous collectons, utilisons et protégeons vos informations 
            lorsque vous utilisez notre plateforme.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>2. Données collectées</h2>
          <p>Nous collectons les informations suivantes :</p>
          <ul className={styles.legalList}>
            <li>✓ Nom et prénom</li>
            <li>✓ Adresse email</li>
            <li>✓ Âge et date de naissance</li>
            <li>✓ Ville de résidence</li>
            <li>✓ Profession</li>
            <li>✓ Photo de profil</li>
            <li>✓ Description personnelle</li>
            <li>✓ Préférences (religion, statut, centres d'intérêt)</li>
            <li>✓ Messages et interactions avec d'autres utilisateurs</li>
          </ul>
        </section>

        <section className={styles.legalSection}>
          <h2>3. Utilisation des données</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className={styles.legalList}>
            <li>✓ Créer et gérer votre compte</li>
            <li>✓ Vous permettre d'interagir avec d'autres membres</li>
            <li>✓ Améliorer nos services et votre expérience utilisateur</li>
            <li>✓ Assurer la sécurité de la plateforme</li>
            <li>✓ Vous envoyer des notifications importantes</li>
            <li>✓ Personnaliser votre expérience</li>
          </ul>
        </section>

        <section className={styles.legalSection}>
          <h2>4. Protection des données</h2>
          <div className={styles.securityGrid}>
            <div className={styles.securityItem}>
              <LockIcon className={styles.securityIcon} />
              <h3>Chiffrement</h3>
              <p>Toutes vos données sont chiffrées et sécurisées</p>
            </div>
            <div className={styles.securityItem}>
              <VerifiedUserIcon className={styles.securityIcon} />
              <h3>Confidentialité</h3>
              <p>Vos informations ne sont jamais partagées sans votre consentement</p>
            </div>
            <div className={styles.securityItem}>
              <SecurityIcon className={styles.securityIcon} />
              <h3>Sécurité</h3>
              <p>Notre plateforme est constamment surveillée</p>
            </div>
          </div>
        </section>

        <section className={styles.legalSection}>
          <h2>5. Cookies</h2>
          <p>
            Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
            Ces cookies nous permettent de :
          </p>
          <ul className={styles.legalList}>
            <li>✓ Vous maintenir connecté</li>
            <li>✓ Mémoriser vos préférences</li>
            <li>✓ Analyser le trafic du site</li>
            <li>✓ Améliorer nos services</li>
          </ul>
          <p className={styles.note}>
            Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, 
            mais cela pourrait affecter certaines fonctionnalités du site.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>6. Partage des données</h2>
          <p>
            Nous ne vendons pas vos données personnelles. Nous ne les partageons qu'avec :
          </p>
          <ul className={styles.legalList}>
            <li>✓ Les autorités légales si requis par la loi</li>
            <li>✓ Nos prestataires techniques (hébergement, maintenance)</li>
          </ul>
        </section>

        <section className={styles.legalSection}>
          <h2>7. Vos droits</h2>
          <p>Vous avez le droit de :</p>
          <ul className={styles.legalList}>
            <li>✓ Accéder à vos données personnelles</li>
            <li>✓ Rectifier vos informations</li>
            <li>✓ Supprimer votre compte</li>
            <li>✓ Vous opposer au traitement de vos données</li>
            <li>✓ Retirer votre consentement à tout moment</li>
          </ul>
        </section>

        <section className={styles.legalSection}>
          <h2>8. Contact DPO</h2>
          <p>
            Pour toute question concernant vos données personnelles, contactez notre 
            Délégué à la Protection des Données :
          </p>
          <div className={styles.contactBox}>
            <p><strong>Email :</strong> dpo@rencontreauthentique.com</p>
            <p><strong>Adresse :</strong> Ouagadougou, Burkina Faso</p>
          </div>
        </section>

        <div className={styles.backLink}>
          <Link href="/">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}