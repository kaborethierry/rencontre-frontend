import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import styles from "./messages.module.css";
import api from "../services/api";
import socketService from "../services/socket";

import ChatIcon from "@mui/icons-material/Chat";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";

export default function Messages() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // ✅ URL de base dynamique
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'rencontreauthentique.org') {
        return 'https://green-alpaca-449310.hostingersite.com';
      }
    }
    return 'http://localhost:5000';
  };

  // ✅ Fonction corrigée pour les images
  const getImageUrl = (photo) => {
    const baseUrl = getBaseUrl();
    
    if (!photo) return "/default-avatar.png";
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    if (photo.startsWith('/uploads')) return `${baseUrl}${photo}`;
    return `${baseUrl}/uploads/profiles/${photo}`;
  };

  // Vérifier les permissions de notification
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("Votre navigateur ne supporte pas les notifications");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification("✅ Notifications activées", {
          body: "Vous recevrez les alertes de nouveaux messages",
          icon: "/logo.png",
          badge: "/favicon.ico"
        });
      }
    } catch (error) {
      console.error("❌ Erreur notification:", error);
    }
  };

  const showNotification = useCallback((title, options = {}) => {
    if (notificationsEnabled && 'Notification' in window && document.visibilityState !== 'visible') {
      try {
        const notification = new Notification(title, {
          icon: "/logo.png",
          badge: "/favicon.ico",
          vibrate: [200, 100, 200],
          requireInteraction: true,
          silent: false,
          ...options
        });

        notification.onclick = () => {
          window.focus();
          if (options.url) router.push(options.url);
          notification.close();
        };

        setTimeout(() => notification.close(), 10000);
      } catch (error) {
        console.error("❌ Erreur affichage notification:", error);
      }
    }
  }, [notificationsEnabled, router]);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (error) {
      // Ignorer les erreurs de son
    }
  }, []);

  // Charger les données
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(user);
    setCurrentUser(parsedUser);

    const initMessages = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Récupérer les conversations
        let convRes = [];
        try {
          convRes = await api.get('/messages/conversations');
        } catch (err) {
          console.log("ℹ️ Pas encore de conversations");
          convRes = [];
        }
        setConversations(convRes || []);

        // Récupérer tous les utilisateurs
        let usersRes = [];
        try {
          usersRes = await api.get('/users/search?limit=100');
        } catch (err) {
          console.log("ℹ️ Erreur chargement utilisateurs");
          usersRes = [];
        }
        setUsers(usersRes || []);

        // Connecter socket
        try {
          socketService.connect();
          
          socketService.onNewMessage((message) => {
            console.log("📨 Nouveau message reçu:", message);
            
            if (message.senderId !== parsedUser.id) {
              const sender = usersRes.find(u => u.id === message.senderId);
              if (sender) {
                showNotification(`📩 Nouveau message de ${sender.prenom}`, {
                  body: message.type === 'image' ? '📷 Photo' : message.content,
                  url: `/chat?userId=${sender.id}`
                });
                playNotificationSound();
              }
            }
            loadConversations();
          });

          socketService.onNewNotification((data) => {
            console.log("📢 Notification:", data);
            showNotification(data.title, { body: data.body, url: data.url });
          });

        } catch (socketErr) {
          console.error("❌ Erreur socket:", socketErr);
        }

      } catch (error) {
        console.error("❌ Erreur chargement:", error);
        setError(error.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    initMessages();

    return () => {
      try {
        socketService.disconnect();
      } catch (e) {}
    };
  }, [router, showNotification, playNotificationSound]);

  const loadConversations = async () => {
    try {
      const convRes = await api.get('/messages/conversations');
      setConversations(convRes || []);
    } catch (error) {
      console.error("❌ Erreur rechargement:", error);
    }
  };

  const getOtherUser = (conversation) => {
    if (!currentUser) return {};
    const otherUserId = conversation.user1Id === currentUser.id 
      ? conversation.user2Id 
      : conversation.user1Id;
    return users.find(u => u.id === otherUserId) || {};
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString("fr-FR");
  };

  const deleteConversation = async (conversationId) => {
    if (!confirm("Supprimer cette conversation ?")) return;
    try {
      await api.delete(`/messages/conversation/${conversationId}`);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.messagesContainer}>
      <div className={styles.messagesHeader}>
        <ChatIcon className={styles.headerIcon} />
        <h2>Mes conversations</h2>
        
        <div className={styles.notificationSection}>
          {notificationPermission !== 'granted' ? (
            <button 
              onClick={requestNotificationPermission} 
              className={styles.notificationBtn}
              title="Activer les notifications"
            >
              <NotificationsOffIcon />
              <span className={styles.notificationText}>Activer les alertes</span>
            </button>
          ) : (
            <div className={styles.notificationActive} title="Notifications actives">
              <NotificationsActiveIcon />
              <span className={styles.notificationText}>Alertes actives</span>
            </div>
          )}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {conversations.length === 0 ? (
        <div className={styles.noConversations}>
          <ChatIcon style={{ fontSize: 80, color: '#ccc' }} />
          <p>Vous n'avez pas encore de conversations</p>
          <Link href="/feed" className={styles.startChatBtn}>
            Commencer à discuter
          </Link>
        </div>
      ) : (
        <div className={styles.conversationsList}>
          {conversations.map((conv) => {
            const otherUser = getOtherUser(conv);
            const isUnread = conv.lastMessage && 
                           conv.lastMessage.senderId !== currentUser?.id && 
                           !conv.lastMessage.isRead;

            if (!otherUser.id) return null;

            return (
              <div 
                key={conv.id} 
                className={`${styles.conversationItem} ${isUnread ? styles.unread : ''}`}
                onClick={() => router.push(`/chat?userId=${otherUser.id}`)}
              >
                <div className={styles.conversationAvatar}>
                  <Image 
                    src={getImageUrl(otherUser.photo)}
                    alt={otherUser.prenom}
                    width={60}
                    height={60}
                    className={styles.avatar}
                    unoptimized
                    onError={(e) => e.target.src = "/default-avatar.png"}
                  />
                  {isUnread && <span className={styles.unreadDot} />}
                </div>

                <div className={styles.conversationInfo}>
                  <div className={styles.conversationHeader}>
                    <h3>{otherUser.prenom} {otherUser.nom}</h3>
                    <div className={styles.timeInfo}>
                      <AccessTimeIcon className={styles.timeIcon} />
                      <span className={styles.conversationDate}>
                        {formatMessageTime(conv.lastMessage?.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className={`${styles.lastMessage} ${isUnread ? styles.unreadMessage : ''}`}>
                    {conv.lastMessage?.senderId === currentUser?.id ? 'Vous : ' : ''}
                    {conv.lastMessage?.type === 'image' ? '📷 Image' : conv.lastMessage?.content}
                  </p>

                  <div className={styles.conversationMeta}>
                    <span className={styles.userInfo}>
                      {otherUser.age} ans • {otherUser.ville}
                    </span>
                  </div>
                </div>

                <button 
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  title="Supprimer la conversation"
                >
                  <DeleteIcon />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}