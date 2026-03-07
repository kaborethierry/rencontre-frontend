import React, { useState, useEffect } from "react";
import Loader from "../components/Loader/Loader";
import Navbar from "../components/Navbar/Navbar";
import "../styles/global.css";
import { useRouter } from "next/router";

export default function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Uniquement charger l'utilisateur depuis localStorage
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

    // Simplement arrêter le loader après 1.5s
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []); // ← NE PAS AJOUTER router.push ici

  return (
    <>
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