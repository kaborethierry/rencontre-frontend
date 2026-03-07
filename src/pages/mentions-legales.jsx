import React from "react";
import Link from "next/link";
import styles from "./legal.module.css";
import GavelIcon from "@mui/icons-material/Gavel";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import PersonIcon from "@mui/icons-material/Person";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function MentionsLegales() {
  return (
    <div className={styles.legalContainer}>
      <div className={styles.legalHeader}>
        <GavelIcon className={styles.legalIcon} />
        <h1>Mentions légales</h1>
        <p className={styles.lastUpdate}>Dernière mise à jour : 6 mars 2026</p>
      </div>

      <div className={styles.legalContent}>
        {/* Éditeur de la plateforme */}
        <section className={styles.legalSection}>
          <h2>
            <BusinessIcon className={styles.sectionIcon} />
            Éditeur de la plateforme
          </h2>
          <div className={styles.infoCard}>
            <p>
              <strong>Nom de l'entreprise :</strong> RencontreAuthentique
            </p>
            <p>
              <strong>Responsable :</strong> M. Zoungrana
            </p>
            <p>
              <strong>Siège social :</strong> Ouagadougou, Burkina Faso
            </p>
            <p>
              <strong>Email :</strong> rencontreserieuse558@gmail.com
            </p>
            <p>
              <strong>Téléphone :</strong> +226 68 74 93 59
            </p>
            <p>
              <strong>WhatsApp :</strong> +226 44 48 83 23
            </p>
          </div>
        </section>

        {/* Directeur de la publication */}
        <section className={styles.legalSection}>
          <h2>
            <PersonIcon className={styles.sectionIcon} />
            Directeur de la publication
          </h2>
          <div className={styles.infoCard}>
            <p>
              <strong>Nom :</strong> Zoungrana
            </p>
            <p>
              <strong>Fonction :</strong> Responsable de la plateforme
            </p>
            <p>
              <strong>Email :</strong> rencontreserieuse558@gmail.com
            </p>
          </div>
        </section>

        {/* Hébergement */}
        <section className={styles.legalSection}>
          <h2>
            <LanguageIcon className={styles.sectionIcon} />
            Hébergement
          </h2>
          <div className={styles.infoCard}>
            <p>
              <strong>Hébergeur :</strong> Vercel Inc.
            </p>
            <p>
              <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA
            </p>
            <p>
              <strong>Site web :</strong> www.vercel.com
            </p>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section className={styles.legalSection}>
          <h2>
            <GavelIcon className={styles.sectionIcon} />
            Propriété intellectuelle
          </h2>
          <p>
            L'ensemble du contenu de la plateforme RencontreAuthentique (textes, images, 
            logos, icônes, base de données) est protégé par les lois sur la propriété 
            intellectuelle et reste la propriété exclusive de RencontreAuthentique.
          </p>
          <p className={styles.note}>
            Toute reproduction, distribution, modification ou utilisation de ces contenus 
            sans autorisation écrite est strictement interdite.
          </p>
        </section>

        {/* Données personnelles */}
        <section className={styles.legalSection}>
          <h2>
            <EmailIcon className={styles.sectionIcon} />
            Données personnelles
          </h2>
          <p>
            Conformément à la loi Informatique et Libertés, vous disposez d'un droit 
            d'accès, de rectification et de suppression de vos données personnelles.
          </p>
          <p>
            Pour exercer ces droits, contactez-nous à : 
            <strong> rencontreserieuse558@gmail.com</strong>
          </p>
          <p className={styles.note}>
            Pour plus d'informations, consultez notre{" "}
            <Link href="/privacy">Politique de confidentialité</Link>.
          </p>
        </section>

        {/* Conditions d'utilisation */}
        <section className={styles.legalSection}>
          <h2>
            <GavelIcon className={styles.sectionIcon} />
            Conditions d'utilisation
          </h2>
          <p>
            L'utilisation de la plateforme est régie par nos{" "}
            <Link href="/conditions">Conditions d'utilisation</Link>.
            En utilisant nos services, vous acceptez ces conditions.
          </p>
        </section>

        {/* Contact */}
        <section className={styles.legalSection}>
          <h2>
            <PhoneIcon className={styles.sectionIcon} />
            Contact
          </h2>
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>
              <EmailIcon className={styles.contactIcon} />
              <div>
                <h3>Email</h3>
                <p>rencontreserieuse558@gmail.com</p>
              </div>
            </div>
            
            <div className={styles.contactItem}>
              <PhoneIcon className={styles.contactIcon} />
              <div>
                <h3>Téléphone</h3>
                <p>+226 68 74 93 59</p>
              </div>
            </div>

            <div className={styles.contactItem}>
              <WhatsAppIcon className={styles.contactIcon} style={{color: '#25D366'}} />
              <div>
                <h3>WhatsApp</h3>
                <p>+226 44 48 83 23</p>
              </div>
            </div>

            <div className={styles.contactItem}>
              <LocationOnIcon className={styles.contactIcon} style={{color: '#FF69B4'}} />
              <div>
                <h3>Adresse</h3>
                <p>Ouagadougou, Burkina Faso</p>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.backLink}>
          <Link href="/">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}