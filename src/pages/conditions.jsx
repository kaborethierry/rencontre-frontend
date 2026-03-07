import React from "react";
import Link from "next/link";
import styles from "./legal.module.css";
import GavelIcon from "@mui/icons-material/Gavel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import SecurityIcon from "@mui/icons-material/Security";
import CopyrightIcon from "@mui/icons-material/Copyright";

export default function Conditions() {
  return (
    <div className={styles.legalContainer}>
      <div className={styles.legalHeader}>
        <GavelIcon className={styles.legalIcon} />
        <h1>Conditions d'utilisation</h1>
        <p className={styles.lastUpdate}>Dernière mise à jour : 6 mars 2026</p>
      </div>

      <div className={styles.legalContent}>
        <section className={styles.legalSection}>
          <h2>1. Acceptation des conditions</h2>
          <p>
            En accédant et en utilisant la plateforme RencontreAuthentique, vous acceptez 
            d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas 
            ces conditions, veuillez ne pas utiliser nos services.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>2. Description du service</h2>
          <p>
            RencontreAuthentique est une plateforme de rencontre en ligne destinée aux 
            personnes majeures (18 ans et plus) recherchant des relations sérieuses et 
            authentiques. Notre service permet aux utilisateurs de créer un profil, 
            publier des contenus, échanger des messages privés et interagir avec d'autres 
            membres dans le respect des règles établies.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>3. Conditions d'inscription</h2>
          <ul className={styles.legalList}>
            <li>
              <CheckCircleIcon className={styles.checkIcon} />
              Vous devez avoir au moins 18 ans pour utiliser nos services.
            </li>
            <li>
              <CheckCircleIcon className={styles.checkIcon} />
              Les informations fournies lors de l'inscription doivent être exactes et à jour.
            </li>
            <li>
              <CheckCircleIcon className={styles.checkIcon} />
              Vous êtes responsable de la confidentialité de votre compte.
            </li>
            <li>
              <WarningIcon className={styles.warningIcon} />
              Un seul compte par personne est autorisé.
            </li>
          </ul>
        </section>

        <section className={styles.legalSection}>
          <h2>4. Comportement des utilisateurs</h2>
          <p>En utilisant notre plateforme, vous vous engagez à :</p>
          <ul className={styles.legalList}>
            <li>✓ Respecter les autres membres et leurs opinions</li>
            <li>✓ Ne pas publier de contenus offensants, discriminatoires ou illégaux</li>
            <li>✓ Ne pas usurper l'identité d'une autre personne</li>
            <li>✓ Ne pas utiliser le service à des fins commerciales non autorisées</li>
            <li>✓ Ne pas harceler ou intimider d'autres utilisateurs</li>
          </ul>
        </section>

        <section className={styles.legalSection}>
          <h2>5. Contenu publié</h2>
          <p>
            Vous conservez tous vos droits sur le contenu que vous publiez. En publiant 
            du contenu sur notre plateforme, vous nous accordez une licence non exclusive 
            pour utiliser, reproduire et distribuer ce contenu dans le cadre du 
            fonctionnement du service.
          </p>
          <p className={styles.note}>
            Note : Nous nous réservons le droit de supprimer tout contenu jugé 
            inapproprié sans préavis.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>6. Suspension et résiliation</h2>
          <p>
            Nous nous réservons le droit de suspendre ou résilier votre compte à tout 
            moment, sans préavis, si vous enfreignez ces conditions d'utilisation ou 
            si votre comportement est jugé préjudiciable à la communauté.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>7. Limitation de responsabilité</h2>
          <p>
            RencontreAuthentique ne peut être tenu responsable des dommages directs ou 
            indirects résultant de l'utilisation de notre service. Nous ne garantissons 
            pas que le service sera ininterrompu ou exempt d'erreurs.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>8. Modifications des conditions</h2>
          <p>
            Nous nous réservons le droit de modifier ces conditions à tout moment. Les 
            modifications prendront effet dès leur publication sur cette page. Il est de 
            votre responsabilité de consulter régulièrement cette page.
          </p>
        </section>

        <section className={styles.legalSection}>
          <h2>9. Contact</h2>
          <p>
            Pour toute question concernant ces conditions, vous pouvez nous contacter à :
          </p>
          <div className={styles.contactBox}>
            <p><strong>Email :</strong> rencontreserieuse558@gmail.com</p>
            <p><strong>Téléphone :</strong> +226 68 74 93 59</p>
          </div>
        </section>

        <div className={styles.backLink}>
          <Link href="/">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}