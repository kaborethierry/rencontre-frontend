import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./contact.module.css";

import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SendIcon from "@mui/icons-material/Send";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import HelpIcon from "@mui/icons-material/Help";
import LockIcon from "@mui/icons-material/Lock";
import ChatIcon from "@mui/icons-material/Chat";
import FlagIcon from "@mui/icons-material/Flag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function Contact() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [reporting, setReporting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ici vous pouvez ajouter un appel API pour envoyer le message
    console.log("Formulaire soumis:", formData);
    
    // Simulation d'envoi
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ nom: "", email: "", sujet: "", message: "" });
    }, 3000);
  };

  const handleReport = () => {
    setReporting(true);
    
    // Créer le lien mailto avec l'email de signalement
    const subject = encodeURIComponent("Signalement d'un problème - RencontreAuthentique");
    const body = encodeURIComponent(
      "Bonjour,\n\nJe souhaite signaler un problème sur la plateforme.\n\n" +
      "Description du problème :\n\n" +
      "Merci de prendre en compte mon signalement.\n\nCordialement."
    );
    
    window.location.href = `mailto:rencontreserieuse558@gmail.com?subject=${subject}&body=${body}`;
    
    setTimeout(() => setReporting(false), 1000);
  };

  const faqItems = [
    {
      icon: <HelpIcon />,
      title: "Comment créer un compte ?",
      description: "Cliquez sur 'Inscription' en haut à droite, remplissez le formulaire avec vos informations et une photo de profil."
    },
    {
      icon: <ChatIcon />,
      title: "Comment envoyer un message ?",
      description: "Une fois connecté, rendez-vous sur le fil d'actualité et cliquez sur 'Message privé' sur le profil de la personne."
    },
    {
      icon: <LockIcon />,
      title: "Mes informations sont-elles sécurisées ?",
      description: "Oui, nous prenons la confidentialité très au sérieux. Vos données sont protégées et jamais partagées."
    },
    {
      icon: <FlagIcon />,
      title: "Comment signaler un problème ?",
      description: "Utilisez le formulaire de contact ou cliquez sur le bouton de signalement ci-dessous pour nous envoyer un email."
    }
  ];

  return (
    <div className={styles.contactContainer}>
      <h1 className={styles.contactTitle}>Contact & Support</h1>

      <div className={styles.contactGrid}>
        {/* Formulaire de contact */}
        <div className={styles.contactFormSection}>
          <h2>
            <SendIcon className={styles.sectionIcon} /> Nous écrire
          </h2>
          {formSubmitted ? (
            <div className={styles.successMessage}>
              <CheckCircleIcon className={styles.successIcon} />
              Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <input
                type="text"
                name="nom"
                placeholder="Votre nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Votre email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="sujet"
                placeholder="Sujet"
                value={formData.sujet}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                placeholder="Votre message..."
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              />
              <button type="submit" className={styles.submitBtn}>
                <SendIcon /> Envoyer le message
              </button>
            </form>
          )}
        </div>

        {/* Informations de contact */}
        <div className={styles.contactInfoSection}>
          <h2>
            <PhoneIcon className={styles.sectionIcon} /> Informations de contact
          </h2>
          
          <div className={styles.infoCards}>
            {/* WhatsApp */}
            <div className={`${styles.infoCard} ${styles.glow}`}>
              <div className={styles.infoIcon} style={{background: '#25D366'}}>
                <WhatsAppIcon />
              </div>
              <div className={styles.infoContent}>
                <h3>WhatsApp</h3>
                <p>+226 44 48 83 23</p>
                <a 
                  href="https://wa.me/22644488323" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  <WhatsAppIcon /> Discuter sur WhatsApp
                </a>
              </div>
            </div>

            {/* Téléphone */}
            <div className={`${styles.infoCard} ${styles.float}`}>
              <div className={styles.infoIcon} style={{background: '#FF69B4'}}>
                <PhoneIcon />
              </div>
              <div className={styles.infoContent}>
                <h3>Téléphone</h3>
                <p>+226 68 74 93 59</p>
                <p className={styles.contactDetail}>Principal</p>
              </div>
            </div>

            {/* Email */}
            <div className={`${styles.infoCard} ${styles.pulse}`}>
              <div className={styles.infoIcon} style={{background: '#EA4335'}}>
                <EmailIcon />
              </div>
              <div className={styles.infoContent}>
                <h3>Email</h3>
                <p>rencontreserieuse558@gmail.com</p>
                <a 
                  href="mailto:rencontreserieuse558@gmail.com"
                  className={styles.contactLink}
                >
                  <EmailIcon /> Envoyer un email
                </a>
              </div>
            </div>

            {/* Adresse physique */}
            <div className={`${styles.infoCard} ${styles.rotate}`}>
              <div className={styles.infoIcon} style={{background: '#0A1F44'}}>
                <LocationOnIcon />
              </div>
              <div className={styles.infoContent}>
                <h3>Adresse physique</h3>
                <p>Burkina Faso, Ouagadougou</p>
                <p className={styles.contactDetail}>Secteur 15, Zone du bois</p>
              </div>
            </div>

            {/* Horaires */}
            <div className={`${styles.infoCard} ${styles.shine}`}>
              <div className={styles.infoIcon} style={{background: '#8B0000'}}>
                <AccessTimeIcon />
              </div>
              <div className={styles.infoContent}>
                <h3>Heures de disponibilité</h3>
                <p>24h/7 - 7 jours sur 7</p>
                <p className={styles.contactDetail}>Service client disponible en permanence</p>
              </div>
            </div>

            {/* Facebook */}
            <div className={`${styles.infoCard} ${styles.bounce}`}>
              <div className={styles.infoIcon} style={{background: '#1877F2'}}>
                <FacebookIcon />
              </div>
              <div className={styles.infoContent}>
                <h3>Facebook</h3>
                <p>Suivez-nous sur Facebook</p>
                <a 
                  href="https://www.facebook.com/profile.php?id=61583157748348"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  <FacebookIcon /> Visiter notre page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section FAQ avec cartes animées */}
      <div className={styles.faqSection}>
        <h2>
          <HelpIcon className={styles.sectionIcon} /> Aide & Support
        </h2>
        
        <div className={styles.faqGrid}>
          {faqItems.map((item, index) => (
            <div key={index} className={`${styles.faqCard} ${styles[`faqCard${index + 1}`]}`}>
              <div className={styles.faqIcon}>
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.reportSection}>
          <button 
            className={styles.reportBtn} 
            onClick={handleReport}
            disabled={reporting}
          >
            <ReportProblemIcon /> 
            {reporting ? 'Ouverture de l\'email...' : 'Signaler un problème'}
          </button>
          <p className={styles.reportHint}>
            Cliquez sur le bouton pour nous envoyer un email à rencontreserieuse558@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}