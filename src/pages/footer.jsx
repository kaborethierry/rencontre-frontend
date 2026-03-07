import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./footer.module.css";

import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CopyrightIcon from "@mui/icons-material/Copyright";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerGrid}>
          {/* À propos */}
          <div className={styles.footerSection}>
            <h3>À propos</h3>
            <p>
              RencontreAuthentique est la plateforme idéale pour trouver l'amour 
              en toute simplicité et discrétion. Rejoignez des milliers de 
              célibataires qui partagent vos valeurs.
            </p>
            <div className={styles.socialLinks}>
              <a 
                href="https://www.facebook.com/profile.php?id=61583157748348" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
                style={{background: '#1877F2'}}
              >
                <FacebookIcon />
              </a>
              <a 
                href="https://wa.me/22644488323" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
                style={{background: '#25D366'}}
              >
                <WhatsAppIcon />
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
                style={{background: '#E4405F'}}
              >
                <InstagramIcon />
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
                style={{background: '#1DA1F2'}}
              >
                <TwitterIcon />
              </a>
            </div>
          </div>

          {/* Conditions d'utilisation */}
          <div className={styles.footerSection}>
            <h3>Informations légales</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/conditions">Conditions d'utilisation</Link>
              </li>
              <li>
                <Link href="/privacy">Politique de confidentialité</Link>
              </li>
              <li>
                <Link href="/cookies">Politique des cookies</Link>
              </li>
              <li>
                <Link href="/mentions-legales">Mentions légales</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.footerSection}>
            <h3>Contact</h3>
            <ul className={styles.contactInfo}>
              <li>
                <PhoneIcon className={styles.contactIcon} />
                <div>
                  <strong>Téléphone:</strong>
                  <p>+226 68 74 93 59</p>
                </div>
              </li>
              <li>
                <WhatsAppIcon className={styles.contactIcon} style={{color: '#25D366'}} />
                <div>
                  <strong>WhatsApp:</strong>
                  <p>+226 44 48 83 23</p>
                </div>
              </li>
              <li>
                <EmailIcon className={styles.contactIcon} style={{color: '#EA4335'}} />
                <div>
                  <strong>Email:</strong>
                  <p>rencontreserieuse558@gmail.com</p>
                </div>
              </li>
              <li>
                <LocationOnIcon className={styles.contactIcon} style={{color: '#FF69B4'}} />
                <div>
                  <strong>Adresse:</strong>
                  <p>Ouagadougou, Burkina Faso</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className={styles.footerSection}>
            <h3>Newsletter</h3>
            <p>Inscrivez-vous pour recevoir nos actualités</p>
            <form className={styles.newsletterForm}>
              <input 
                type="email" 
                placeholder="Votre email" 
                className={styles.newsletterInput}
              />
              <button type="submit" className={styles.newsletterBtn}>
                S'inscrire
              </button>
            </form>
            <p className={styles.horaires}>
              <strong>Disponibilité:</strong> 24h/7 - 7j/7
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p>
            <CopyrightIcon className={styles.copyrightIcon} />
            {new Date().getFullYear()} RencontreAuthentique. Tous droits réservés.
          </p>
          <p className={styles.credit}>
            Créé avec 💕 pour vous aider à trouver l'amour
          </p>
        </div>
      </div>
    </footer>
  );
}