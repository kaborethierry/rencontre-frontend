// src/services/socket.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map(); // Pour stocker les callbacks par événement
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Connecter le socket
  connect() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ Pas de token, connexion socket impossible');
      return null;
    }

    // Éviter les connexions multiples
    if (this.socket?.connected) {
      console.log('✅ Socket déjà connecté');
      return this.socket;
    }

    try {
      this.socket = io('http://localhost:5000', {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000
      });

      // Gestionnaire de connexion
      this.socket.on('connect', () => {
        console.log('✅ Socket connecté avec succès');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      // Gestionnaire de déconnexion
      this.socket.on('disconnect', (reason) => {
        console.log('🔴 Socket déconnecté:', reason);
        this.isConnected = false;
        
        if (reason === 'io server disconnect') {
          // Déconnexion initiée par le serveur, on ne reconnecte pas
          console.log('Déconnexion serveur');
        }
      });

      // Gestionnaire d'erreur de connexion
      this.socket.on('connect_error', (error) => {
        console.error('❌ Erreur de connexion socket:', error.message);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
          this.disconnect();
        }
      });

      // Gestionnaire de reconnexion
      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Socket reconnecté après ${attemptNumber} tentatives`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      // Gestionnaire d'erreur de reconnexion
      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Erreur de reconnexion:', error.message);
      });

      // Gestionnaire d'événements personnalisés
      this.setupEventListeners();

      return this.socket;

    } catch (error) {
      console.error('❌ Erreur lors de la création du socket:', error);
      return null;
    }
  }

  // Configurer les écouteurs d'événements par défaut
  setupEventListeners() {
    if (!this.socket) return;

    // Écouter les erreurs
    this.socket.on('message-error', (data) => {
      console.error('❌ Erreur message:', data.error);
      this.triggerCallbacks('message-error', data);
    });

    // Écouter les notifications
    this.socket.on('new-notification', (data) => {
      console.log('📢 Nouvelle notification reçue:', data);
      this.triggerCallbacks('new-notification', data);
    });

    // Écouter les messages reçus
    this.socket.on('receive-message', (data) => {
      console.log('📨 Message reçu:', data);
      this.triggerCallbacks('receive-message', data);
    });

    // Écouter les messages envoyés
    this.socket.on('message-sent', (data) => {
      console.log('✅ Message envoyé:', data);
      this.triggerCallbacks('message-sent', data);
    });

    // Écouter les indicateurs de frappe
    this.socket.on('user-typing', (data) => {
      this.triggerCallbacks('user-typing', data);
    });

    // Écouter les confirmations de lecture
    this.socket.on('messages-read', (data) => {
      console.log('📖 Messages lus:', data);
      this.triggerCallbacks('messages-read', data);
    });
  }

  // Déconnecter le socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('🔌 Socket déconnecté manuellement');
    }
  }

  // Vérifier si le socket est connecté
  isSocketConnected() {
    return this.socket?.connected || false;
  }

  // Envoyer un message
  sendMessage(data) {
    if (!this.socket?.connected) {
      console.error('❌ Socket non connecté');
      return false;
    }

    try {
      this.socket.emit('send-message', data);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      return false;
    }
  }

  // Marquer les messages comme lus
  markAsRead(messageIds, senderId) {
    if (!this.socket?.connected) {
      console.error('❌ Socket non connecté');
      return false;
    }

    try {
      this.socket.emit('mark-read', { messageIds, senderId });
      return true;
    } catch (error) {
      console.error('❌ Erreur marquage lecture:', error);
      return false;
    }
  }

  // Indiquer que l'utilisateur est en train d'écrire
  sendTyping(receiverId, isTyping) {
    if (!this.socket?.connected) {
      return false;
    }

    try {
      this.socket.emit('typing', { receiverId, isTyping });
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi typing:', error);
      return false;
    }
  }

  // Méthode générique pour ajouter un écouteur
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Méthode générique pour retirer un écouteur
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    if (callback) {
      // Retirer un callback spécifique
      const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
      this.listeners.set(event, callbacks);
    } else {
      // Retirer tous les callbacks pour cet événement
      this.listeners.delete(event);
    }
  }

  // Déclencher tous les callbacks pour un événement
  triggerCallbacks(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Erreur dans le callback pour ${event}:`, error);
        }
      });
    }
  }

  // Méthodes spécifiques pour chaque type d'événement (compatibilité ascendante)
  onNewMessage(callback) {
    this.on('receive-message', callback);
  }

  onMessageSent(callback) {
    this.on('message-sent', callback);
  }

  onUserTyping(callback) {
    this.on('user-typing', callback);
  }

  onMessagesRead(callback) {
    this.on('messages-read', callback);
  }

  onNewNotification(callback) {
    this.on('new-notification', callback);
  }

  onMessageError(callback) {
    this.on('message-error', callback);
  }

  // Méthodes pour retirer les écouteurs spécifiques
  offNewMessage(callback) {
    this.off('receive-message', callback);
  }

  offMessageSent(callback) {
    this.off('message-sent', callback);
  }

  offUserTyping(callback) {
    this.off('user-typing', callback);
  }

  offMessagesRead(callback) {
    this.off('messages-read', callback);
  }

  offNewNotification(callback) {
    this.off('new-notification', callback);
  }

  offMessageError(callback) {
    this.off('message-error', callback);
  }

  // Nettoyer tous les écouteurs
  clearAllListeners() {
    this.listeners.clear();
  }
}

// Créer et exporter une instance unique
const socketService = new SocketService();
export default socketService;