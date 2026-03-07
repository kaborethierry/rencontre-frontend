import React from "react";
import Hero from "../components/Hero/Hero";
import AboutPage from "./about";
import Feed from "./feed";
import Contact from "../components/contact/contact";
import Footer from "./footer";

export default function Home({ user, setUser }) {
  return (
    <>
      <Hero />
      <AboutPage />
      <Feed user={user} setUser={setUser} />
      <Contact />
      <Footer />
    </>
  );
}