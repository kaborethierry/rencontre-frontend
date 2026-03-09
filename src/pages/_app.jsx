// src/pages/_app.jsx
import React, { useState, useEffect } from "react";
import Loader from "../components/Loader/Loader";
import Navbar from "../components/Navbar/Navbar";
import Head from "next/head";
import "../styles/global.css";
import { useRouter } from "next/router";

export default function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Erreur parsing user:", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getPageMetadata = () => {
    const path = router.pathname;
    
    let title = "RencontreAuthentique - Site de rencontre sérieux et discret";
    let description = "RencontreAuthentique est le site de rencontre idéal pour trouver l'amour en toute discrétion. Inscription gratuite, profils vérifiés et chat en temps réel.";
    let image = "/og-image.jpg";
    
    if (path === '/') {
      title = "RencontreAuthentique - Site de rencontre sérieux";
      description = "Trouvez l'amour sur RencontreAuthentique. Des milliers de célibataires vous attendent.";
    } else if (path === '/about') {
      title = "À propos - RencontreAuthentique";
      description = "Découvrez l'histoire et la mission de RencontreAuthentique, le site de rencontre qui vous correspond.";
    } else if (path === '/contact') {
      title = "Contact - RencontreAuthentique";
      description = "Contactez l'équipe de RencontreAuthentique pour toute question ou suggestion.";
    } else if (path === '/feed') {
      title = "Fil d'actualité - RencontreAuthentique";
      description = "Découvrez les dernières publications et rencontrez des célibataires près de chez vous.";
    } else if (path === '/login') {
      title = "Connexion - RencontreAuthentique";
      description = "Connectez-vous à votre compte RencontreAuthentique pour accéder à votre espace personnel.";
    } else if (path === '/register') {
      title = "Inscription - RencontreAuthentique";
      description = "Créez votre compte gratuit sur RencontreAuthentique et commencez votre recherche de l'amour.";
    } else if (path.startsWith('/profile/')) {
      title = "Profil - RencontreAuthentique";
      description = "Découvrez le profil d'un célibataire sur RencontreAuthentique.";
    } else if (path === '/messages') {
      title = "Messages - RencontreAuthentique";
      description = "Consultez vos messages privés sur RencontreAuthentique.";
    } else if (path === '/privacy') {
      title = "Politique de confidentialité - RencontreAuthentique";
      description = "Consultez notre politique de confidentialité pour comprendre comment nous protégeons vos données.";
    } else if (path === '/conditions') {
      title = "Conditions d'utilisation - RencontreAuthentique";
      description = "Lisez les conditions d'utilisation de RencontreAuthentique.";
    } else if (path === '/cookies') {
      title = "Politique des cookies - RencontreAuthentique";
      description = "En savoir plus sur l'utilisation des cookies sur RencontreAuthentique.";
    }
    
    return { title, description, image };
  };

  const { title, description, image } = getPageMetadata();

  return (
    <>
      <Head>
        {/* 🔥 AJOUT DE LA BALISE GOOGLE VERIFICATION */}
        <meta name="google-site-verification" content="b6SMvqmG4rigKcx-0NHE-1XA6XmfoOJiHfd8Kh-vXN0" />
        
        {/* Métadonnées de base */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="rencontre, site de rencontre, amour, célibataires, chat, relation sérieuse, dating, Burkina Faso, Afrique" />
        <meta name="author" content="RencontreAuthentique" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />
        <link rel="canonical" href={`https://rencontreauthentique.org${router.asPath}`} />
        
        {/* Open Graph (Facebook, LinkedIn) */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`https://rencontreauthentique.org${image}`} />
        <meta property="og:url" content={`https://rencontreauthentique.org${router.asPath}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="RencontreAuthentique" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`https://rencontreauthentique.org${image}`} />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
      </Head>

      {loading ? (
        <Loader onComplete={() => setLoading(false)} />
      ) : (
        <>
          <Navbar user={user} setUser={setUser} />
          <Component {...pageProps} user={user} setUser={setUser} />
        </>
      )}
    </>
  );
}