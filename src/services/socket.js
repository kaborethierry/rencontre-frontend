// src/services/socket.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
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

    if (this.socket?.connected) {
      console.log('✅ Socket déjà connecté');
      return this.socket;
    }

    try {
      // 👇 LIGNE MODIFIÉE - URL de votre backend Hostinger
      this.socket = io('https://green-alpaca-449310.hostingersite.com', {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connecté avec succès');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔴 Socket déconnecté:', reason);
        this.isConnected = false;
        
        if (reason === 'io server disconnect') {
          console.log('Déconnexion serveur');
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erreur de connexion socket:', error.message);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
          this.disconnect();
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Socket reconnecté après ${attemptNumber} tentatives`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Erreur de reconnexion:', error.message);
      });

      this.setupEventListeners();

      return this.socket;

    } catch (error) {
      console.error('❌ Erreur lors de la création du socket:', error);
      return null;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('message-error', (data) => {
      console.error('❌ Erreur message:', data.error);
      this.triggerCallbacks('message-error', data);
    });

    this.socket.on('new-notification', (data) => {
      console.log('📢 Nouvelle notification reçue:', data);
      this.triggerCallbacks('new-notification', data);
    });

    this.socket.on('receive-message', (data) => {
      console.log('📨 Message reçu:', data);
      this.triggerCallbacks('receive-message', data);
    });

    this.socket.on('message-sent', (data) => {
      console.log('✅ Message envoyé:', data);
      this.triggerCallbacks('message-sent', data);
    });

    this.socket.on('user-typing', (data) => {
      this.triggerCallbacks('user-typing', data);
    });

    this.socket.on('messages-read', (data) => {
      console.log('📖 Messages lus:', data);
      this.triggerCallbacks('messages-read', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('🔌 Socket déconnecté manuellement');
    }
  }

  isSocketConnected() {
    return this.socket?.connected || false;
  }

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

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    if (callback) {
      const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
      this.listeners.set(event, callbacks);
    } else {
      this.listeners.delete(event);
    }
  }

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

  clearAllListeners() {
    this.listeners.clear();
  }
}

const socketService = new SocketService();
export default socketService;