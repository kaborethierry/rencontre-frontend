import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "./chat.module.css";
import api from "../services/api";
import socketService from "../services/socket";

import SendIcon from "@mui/icons-material/Send";
import ImageIcon from "@mui/icons-material/Image";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import BlockIcon from "@mui/icons-material/Block";
import ReportIcon from "@mui/icons-material/Report";

export default function Chat() {
  const router = useRouter();
  const { userId } = router.query;
  
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingImage, setSendingImage] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const emojis = ["😊", "😂", "❤️", "😍", "👍", "🎉", "😢", "😡", "🤔", "👋", "💕", "😘", "🥰", "😁", "🤗", "🙏", "🔥", "✨", "🌟", "💫"];

  // Fonction de compression d'image - UTILISER UN AUTRE NOM
  const compressImageFile = (base64, maxSize = 500 * 1024) => { // 500KB max
    return new Promise((resolve, reject) => {
      // Utiliser Image du DOM, pas le composant Next.js
      const imgElement = document.createElement('img');
      imgElement.src = base64;
      imgElement.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = imgElement.width;
          let height = imgElement.height;
          
          // Redimensionner si trop grande
          const maxDimension = 800;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round(height * maxDimension / width);
              width = maxDimension;
            } else {
              width = Math.round(width * maxDimension / height);
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(imgElement, 0, 0, width, height);
          
          // Compresser avec qualité variable
          let quality = 0.9;
          let compressed = canvas.toDataURL('image/jpeg', quality);
          
          while (compressed.length > maxSize && quality > 0.1) {
            quality -= 0.1;
            compressed = canvas.toDataURL('image/jpeg', quality);
          }
          
          console.log(`✅ Image compressée: ${(base64.length / 1024).toFixed(2)}KB -> ${(compressed.length / 1024).toFixed(2)}KB`);
          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };
      imgElement.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push("/login");
      return;
    }

    setCurrentUser(JSON.parse(user));

    const initChat = async () => {
      try {
        setLoading(true);
        
        // Récupérer les infos de l'autre utilisateur
        if (userId) {
          const userRes = await api.get(`/users/${userId}`);
          setOtherUser(userRes);
        }

        // Charger les messages
        await loadMessages();

        // Connecter socket
        socketService.connect();
        
        // Écouter les nouveaux messages
        socketService.onNewMessage((message) => {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        });

        socketService.onMessageSent((message) => {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        });

        socketService.onUserTyping((data) => {
          if (data.userId === parseInt(userId)) {
            setOtherUserTyping(data.isTyping);
          }
        });

      } catch (error) {
        console.error("Erreur initialisation chat:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      socketService.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [userId]);

  const loadMessages = async () => {
    try {
      const response = await api.get(`/messages/${userId}`);
      setMessages(response || []);
      scrollToBottom();
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser || !otherUser) return;

    socketService.sendMessage({
      receiverId: parseInt(userId),
      content: newMessage,
      type: 'text'
    });

    setNewMessage("");
    setShowEmoji(false);
  };

  const handleSendImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image ne doit pas dépasser 5 Mo");
        return;
      }

      setSendingImage(true);

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          // Compresser l'image avant envoi - utiliser le nouveau nom
          const compressedImage = await compressImageFile(reader.result);
          
          socketService.sendMessage({
            receiverId: parseInt(userId),
            image: compressedImage,
            type: 'image'
          });
        } catch (error) {
          console.error("❌ Erreur compression image:", error);
          alert("Erreur lors du traitement de l'image");
        } finally {
          setSendingImage(false);
        }
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmoji(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    // Indiquer que l'utilisateur est en train d'écrire
    if (otherUser) {
      socketService.sendTyping(parseInt(userId), true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTyping(parseInt(userId), false);
      }, 1000);
    }
  };

  const handleBlockUser = () => {
    if (confirm(`Voulez-vous bloquer ${otherUser?.prenom} ?`)) {
      alert("Utilisateur bloqué");
      router.push("/messages");
    }
  };

  const handleReportUser = () => {
    const reason = prompt("Raison du signalement :");
    if (reason) {
      alert("Signalement envoyé");
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    return date.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });
  };

  const getImageUrl = (photo) => {
    if (!photo) return "/default-avatar.png";
    if (photo.startsWith('http')) return photo;
    if (photo.startsWith('/uploads')) return `http://localhost:5000${photo}`;
    return `http://localhost:5000/uploads/${photo}`;
  };

  if (loading) {
    return <div className={styles.loading}>Chargement de la conversation...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!currentUser || !otherUser) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.userInfo}>
          <Image 
            src={getImageUrl(otherUser.photo)}
            alt={otherUser.prenom}
            width={45}
            height={45}
            className={styles.contactPhoto}
            unoptimized
          />
          <div className={styles.contactInfo}>
            <h3>{otherUser.prenom} {otherUser.nom}</h3>
            <p className={styles.onlineStatus}>
              <span className={styles.onlineDot}></span>
              En ligne
            </p>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <button onClick={handleBlockUser} className={styles.headerBtn} title="Bloquer">
            <BlockIcon />
          </button>
          <button onClick={handleReportUser} className={styles.headerBtn} title="Signaler">
            <ReportIcon />
          </button>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => {
          const showDate = index === 0 || 
            new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1]?.createdAt).toDateString();

          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className={styles.dateSeparator}>
                  <span>
                    {new Date(msg.createdAt).toLocaleDateString("fr-FR", { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
              
              <div
                className={msg.senderId === currentUser.id ? styles.myMessage : styles.otherMessage}
              >
                {msg.senderId !== currentUser.id && (
                  <Image 
                    src={getImageUrl(msg.senderPhoto)}
                    alt={msg.senderName}
                    width={30}
                    height={30}
                    className={styles.messageAvatar}
                    unoptimized
                  />
                )}
                
                <div className={styles.messageContent}>
                  {msg.type === "image" ? (
                    <div className={styles.imageContainer}>
                      <Image 
                        src={msg.image} 
                        alt="image envoyée" 
                        width={200}
                        height={200}
                        className={styles.messageImage}
                        onClick={() => window.open(msg.image, "_blank")}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <p className={styles.messageText}>{msg.content}</p>
                  )}
                  <div className={styles.messageFooter}>
                    <span 
                      className={styles.messageTime}
                      title={new Date(msg.createdAt).toLocaleString("fr-FR")}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </span>
                    {msg.senderId === currentUser.id && (
                      <span className={styles.readReceipt} title={msg.isRead ? "Vu" : "Envoyé"}>
                        {msg.isRead ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        
        {otherUserTyping && (
          <div className={styles.typingIndicator}>
            <div className={styles.typingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>{otherUser.prenom} écrit...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInput}>
        <button 
          onClick={() => setShowEmoji(!showEmoji)} 
          className={`${styles.emojiBtn} ${showEmoji ? styles.active : ''}`}
          title="Emojis"
          disabled={sendingImage}
        >
          <InsertEmoticonIcon />
        </button>

        <button 
          onClick={handleSendImage} 
          className={styles.imageBtn} 
          title="Envoyer une image"
          disabled={sendingImage}
        >
          <ImageIcon />
        </button>

        <textarea
          placeholder={sendingImage ? "Compression de l'image..." : `Écrire un message à ${otherUser.prenom}...`}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows="1"
          disabled={sendingImage}
        />

        <button 
          onClick={handleSendMessage} 
          className={styles.sendBtn}
          disabled={!newMessage.trim() || sendingImage}
          title="Envoyer"
        >
          <SendIcon />
        </button>

        {showEmoji && !sendingImage && (
          <div className={styles.emojiPicker}>
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className={styles.emojiItem}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}