import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "./admin.module.css";
import api from "../services/api";

// Icônes Material-UI
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PostAddIcon from "@mui/icons-material/PostAdd";
import ReportIcon from "@mui/icons-material/Report";
import ChatIcon from "@mui/icons-material/Chat";
import EmailIcon from "@mui/icons-material/Email";
import FavoriteIcon from "@mui/icons-material/Favorite";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HomeIcon from "@mui/icons-material/Home";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReplyIcon from "@mui/icons-material/Reply";
import WarningIcon from "@mui/icons-material/Warning";
import ImageIcon from "@mui/icons-material/Image";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";

export default function Admin({ user }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [permission, setPermission] = useState('default');

  // ✅ URL de base dynamique
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname.includes('rencontreauthentique.org')) {
        return 'https://green-alpaca-449310.hostingersite.com';
      }
    }
    return 'http://localhost:5000';
  };

  // ✅ Fonction pour les images
  const getImageUrl = (photo) => {
    const baseUrl = getBaseUrl();
    if (!photo) return "/default-avatar.png";
    if (photo.startsWith('http')) return photo;
    return `${baseUrl}${photo}`;
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // ✅ Demander la permission pour les notifications
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(perm => setPermission(perm));
      }
    }

    // Enregistrer le service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker enregistré'))
        .catch(err => console.error('Erreur SW:', err));
    }
  }, []);

  // ✅ Fonction pour jouer le son et afficher la notification
  const showNotification = (title, body, url = '/admin') => {
    // Son
    if (soundEnabled) {
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log("Son bloqué"));
      } catch (error) {}
    }

    // Notification push
    if ('Notification' in window && Notification.permission === 'granted') {
      // Notification native
      const notification = new Notification(title, {
        body: body,
        icon: '/logo192.png',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: 'new-post',
        renotify: true,
        requireInteraction: true,
        silent: !soundEnabled
      });

      notification.onclick = () => {
        window.focus();
        router.push(url);
        notification.close();
      };
    }
  };

  // ✅ Charger les notifications et posts en attente
  const loadPendingData = async () => {
    try {
      // Récupérer les notifications non lues
      const notifsRes = await api.get('/notifications/unread').catch(() => []);
      const newNotifs = notifsRes || [];
      
      // Récupérer les posts en attente
      const pendingRes = await api.get('/admin/posts/pending').catch(() => []);
      const newPending = pendingRes || [];
      
      // S'il y a de nouvelles notifications, alerter l'admin
      if (newPending.length > pendingPosts.length || newNotifs.length > notifications.length) {
        showNotification(
          '📝 Nouvelle publication en attente',
          `${newPending[0]?.prenom} ${newPending[0]?.nom} a publié un message`,
          '/admin?tab=posts'
        );
      }
      
      setPendingPosts(newPending);
      setNotifications(newNotifs);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/adminlogin');
      return;
    }

    if (!user) return;

    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    loadDashboardData();
    
    // Vérifier les nouvelles publications toutes les 15 secondes
    const interval = setInterval(loadPendingData, 15000);
    
    return () => clearInterval(interval);
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, postsRes, reportsRes, convRes, contactRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/posts'),
        api.get('/admin/reports'),
        api.get('/admin/conversations'),
        api.get('/admin/contact-messages')
      ]);

      setStats(statsRes);
      setUsers(usersRes || []);
      setPosts(postsRes || []);
      setReports(reportsRes || []);
      setConversations(convRes || []);
      setContactMessages(contactRes || []);
      
      const now = new Date();
      const online = usersRes.filter(u => {
        if (!u.lastLogin) return false;
        const lastLogin = new Date(u.lastLogin);
        const diff = (now - lastLogin) / (1000 * 60);
        return diff < 5;
      }).length;
      setOnlineUsers(online);

      // Charger les posts en attente
      await loadPendingData();
      
    } catch (error) {
      console.error("Erreur chargement admin:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    if (conversationMessages[conversationId]) return;
    
    try {
      const messages = await api.get(`/admin/conversations/${conversationId}/messages`);
      setConversationMessages(prev => ({
        ...prev,
        [conversationId]: messages || []
      }));
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/toggle`, { isActive: !currentStatus });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isActive: !currentStatus } : u
      ));
    } catch (error) {
      console.error("Erreur changement statut:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("⚠️ Supprimer définitivement cet utilisateur ?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error("Erreur suppression utilisateur:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Supprimer cette publication ?")) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
      setPendingPosts(pendingPosts.filter(p => p.id !== postId));
    } catch (error) {
      console.error("Erreur suppression post:", error);
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      await api.put(`/admin/posts/${postId}/approve`);
      setPendingPosts(pendingPosts.filter(p => p.id !== postId));
      // Son de confirmation
      if (soundEnabled) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => {});
        } catch (error) {}
      }
    } catch (error) {
      console.error("Erreur approbation:", error);
    }
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      await api.put(`/admin/reports/${reportId}/resolve`, { 
        status: 'resolved', 
        action 
      });
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: 'resolved' } : r
      ));
    } catch (error) {
      console.error("Erreur traitement signalement:", error);
    }
  };

  const handleViewConversation = async (conversation) => {
    if (selectedConversation?.id === conversation.id) {
      setSelectedConversation(null);
    } else {
      setSelectedConversation(conversation);
      await loadConversationMessages(conversation.id);
    }
  };

  const handleBackToSite = () => {
    router.push('/');
  };

  const handleReplyToContact = (email, subject) => {
    window.location.href = `mailto:${email}?subject=Re: ${subject}`;
  };

  const filteredUsers = users.filter(u => 
    u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = pendingPosts.length + notifications.length;

  if (loading) {
    return <div className={styles.loading}>Chargement du portail admin...</div>;
  }

  return (
    <div className={styles.adminContainer}>
      {/* En-tête avec message de bienvenue */}
      <div className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Administration</h1>
        
        {user && (
          <div className={styles.welcomeBanner}>
            <div className={styles.welcomeContent}>
              <span className={styles.welcomeEmoji}>👋</span>
              <div>
                <h3>Bonjour, {user.prenom} {user.nom} !</h3>
                <p>Bienvenue dans votre espace d'administration</p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.adminBadge}>
                <AdminPanelSettingsIcon />
                <span>Administrateur</span>
              </div>
              <button 
                className={styles.notificationBtn}
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Son activé" : "Son désactivé"}
              >
                {soundEnabled ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
                {totalPending > 0 && <span className={styles.notificationBadge}>{totalPending}</span>}
              </button>
              <button onClick={handleBackToSite} className={styles.backToSiteBtn}>
                <HomeIcon /> Retour au site
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Barre latérale */}
      <div className={styles.adminLayout}>
        <div className={styles.sidebar}>
          <button 
            className={`${styles.sidebarItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <DashboardIcon /> Tableau de bord
          </button>
          <button 
            className={`${styles.sidebarItem} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <PeopleIcon /> Utilisateurs
            <span className={styles.badge}>{users.length}</span>
          </button>
          <button 
            className={`${styles.sidebarItem} ${activeTab === 'posts' ? styles.active : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <PostAddIcon /> Publications
            {pendingPosts.length > 0 && <span className={styles.badge}>{pendingPosts.length}</span>}
          </button>
          <button 
            className={`${styles.sidebarItem} ${activeTab === 'reports' ? styles.active : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <ReportIcon /> Signalements
            <span className={styles.badge}>{reports.filter(r => r.status === 'pending').length}</span>
          </button>
          <button 
            className={`${styles.sidebarItem} ${activeTab === 'messages' ? styles.active : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <ChatIcon /> Messages privés
            <span className={styles.badge}>{conversations.length}</span>
          </button>
          <button 
            className={`${styles.sidebarItem} ${activeTab === 'contact' ? styles.active : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <EmailIcon /> Contact
            <span className={styles.badge}>{contactMessages.filter(m => m.status === 'non lu').length}</span>
          </button>
        </div>

        <div className={styles.mainContent}>
          {/* Tableau de bord */}
          {activeTab === 'dashboard' && stats && (
            <div className={styles.dashboard}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <PeopleIcon className={styles.statIcon} />
                  <div className={styles.statInfo}>
                    <h3>Utilisateurs</h3>
                    <p className={styles.statNumber}>{stats.totalUsers}</p>
                    <small>+{stats.newUsersToday} aujourd'hui</small>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <AccessTimeIcon className={styles.statIcon} style={{color: '#2196F3'}} />
                  <div className={styles.statInfo}>
                    <h3>En ligne</h3>
                    <p className={styles.statNumber}>{onlineUsers}</p>
                    <small>Connectés maintenant</small>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <PostAddIcon className={styles.statIcon} />
                  <div className={styles.statInfo}>
                    <h3>Publications</h3>
                    <p className={styles.statNumber}>{stats.totalPosts}</p>
                    <small>+{stats.newPostsToday} aujourd'hui</small>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <ChatIcon className={styles.statIcon} />
                  <div className={styles.statInfo}>
                    <h3>Commentaires</h3>
                    <p className={styles.statNumber}>{stats.totalComments}</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <FavoriteIcon className={styles.statIcon} />
                  <div className={styles.statInfo}>
                    <h3>Likes</h3>
                    <p className={styles.statNumber}>{stats.totalLikes}</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <WarningIcon className={styles.statIcon} style={{color: '#ff9800'}} />
                  <div className={styles.statInfo}>
                    <h3>Signalements</h3>
                    <p className={styles.statNumber}>{stats.pendingReports || 0}</p>
                    <small>En attente</small>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <BlockIcon className={styles.statIcon} style={{color: '#f44336'}} />
                  <div className={styles.statInfo}>
                    <h3>Suspendus</h3>
                    <p className={styles.statNumber}>{stats.suspendedUsers}</p>
                  </div>
                </div>
              </div>

              {/* Graphiques simplifiés */}
              <div className={styles.chartsSection}>
                <div className={styles.chartCard}>
                  <h3>Nouveaux utilisateurs (6 mois)</h3>
                  <div className={styles.barChart}>
                    {stats.usersByMonth?.map((item, index) => (
                      <div key={index} className={styles.barItem}>
                        <div className={styles.barLabel}>{item.month}</div>
                        <div className={styles.barContainer}>
                          <div 
                            className={styles.bar}
                            style={{ 
                              width: `${Math.min(100, (item.count / Math.max(...stats.usersByMonth.map(i => i.count)) * 100))}%` 
                            }}
                          >
                            {item.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.chartCard}>
                  <h3>Nouvelles publications (6 mois)</h3>
                  <div className={styles.barChart}>
                    {stats.postsByMonth?.map((item, index) => (
                      <div key={index} className={styles.barItem}>
                        <div className={styles.barLabel}>{item.month}</div>
                        <div className={styles.barContainer}>
                          <div 
                            className={styles.bar}
                            style={{ 
                              width: `${Math.min(100, (item.count / Math.max(...stats.postsByMonth.map(i => i.count)) * 100))}%` 
                            }}
                          >
                            {item.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gestion des utilisateurs */}
          {activeTab === 'users' && (
            <div className={styles.usersSection}>
              <div className={styles.sectionHeader}>
                <h2>Gestion des utilisateurs</h2>
                <div className={styles.searchBox}>
                  <SearchIcon />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Photo</th>
                      <th>Nom & Prénom</th>
                      <th>Email</th>
                      <th>Âge</th>
                      <th>Ville</th>
                      <th>Rôle</th>
                      <th>Status</th>
                      <th>Posts</th>
                      <th>Commentaires</th>
                      <th>Dernière connexion</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className={!user.isActive ? styles.suspended : ''}>
                        <td>{user.id}</td>
                        <td>
                          <div className={styles.avatarWrapper}>
                            {!imageErrors[`user-${user.id}`] ? (
                              <Image 
                                src={getImageUrl(user.photo)}
                                alt={user.prenom}
                                width={40}
                                height={40}
                                className={styles.userAvatar}
                                onError={() => handleImageError(`user-${user.id}`)}
                                unoptimized
                              />
                            ) : (
                              <div className={styles.avatarFallback}>
                                <PersonIcon />
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{user.prenom} {user.nom}</td>
                        <td>{user.email}</td>
                        <td>{user.age}</td>
                        <td>{user.ville}</td>
                        <td>
                          <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.adminRole : styles.userRole}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                            {user.isActive ? 'Actif' : 'Suspendu'}
                          </span>
                        </td>
                        <td>{user.postsCount || 0}</td>
                        <td>{user.commentsCount || 0}</td>
                        <td>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : 'Jamais'}
                        </td>
                        <td>
                          <button 
                            className={`${styles.actionBtn} ${user.isActive ? styles.suspendBtn : styles.activateBtn}`}
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            title={user.isActive ? 'Suspendre' : 'Activer'}
                          >
                            {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDeleteUser(user.id)}
                            title="Supprimer"
                          >
                            <DeleteIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gestion des publications */}
          {activeTab === 'posts' && (
            <div className={styles.postsSection}>
              <h2>Publications en attente ({pendingPosts.length})</h2>
              <div className={styles.pendingPostsList}>
                {pendingPosts.length === 0 ? (
                  <p className={styles.noPosts}>Aucune publication en attente</p>
                ) : (
                  pendingPosts.map(post => (
                    <div key={post.id} className={styles.pendingPostCard}>
                      <div className={styles.postHeader}>
                        <Image 
                          src={getImageUrl(post.photo)}
                          alt={post.prenom}
                          width={50}
                          height={50}
                          className={styles.userAvatar}
                          unoptimized
                        />
                        <div>
                          <strong>{post.prenom} {post.nom}</strong>
                          <p>{post.age} ans | {post.ville} | {post.religion}</p>
                          <small>{new Date(post.createdAt).toLocaleString('fr-FR')}</small>
                        </div>
                      </div>
                      <p className={styles.postContent}>{post.content}</p>
                      <div className={styles.postActions}>
                        <button 
                          className={styles.approveBtn}
                          onClick={() => handleApprovePost(post.id)}
                        >
                          <CheckCircleIcon /> Approuver
                        </button>
                        <button 
                          className={styles.rejectBtn}
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <DeleteIcon /> Rejeter
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Gestion des signalements */}
          {activeTab === 'reports' && (
            <div className={styles.reportsSection}>
              <h2>Gestion des signalements</h2>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Signalé par</th>
                      <th>Utilisateur signalé</th>
                      <th>Post signalé</th>
                      <th>Raison</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id}>
                        <td>{report.id}</td>
                        <td>
                          <div className={styles.reporterInfo}>
                            <div className={styles.miniAvatarWrapper}>
                              {!imageErrors[`reporter-${report.id}`] ? (
                                <Image 
                                  src={getImageUrl(report.reporterPhoto)}
                                  alt={report.reporterPrenom}
                                  width={25}
                                  height={25}
                                  className={styles.miniAvatar}
                                  onError={() => handleImageError(`reporter-${report.id}`)}
                                  unoptimized
                                />
                              ) : (
                                <div className={styles.miniAvatarFallback}>
                                  <PersonIcon style={{ fontSize: 16 }} />
                                </div>
                              )}
                            </div>
                            <span>{report.reporterPrenom} {report.reporterNom}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.reportedInfo}>
                            <div className={styles.miniAvatarWrapper}>
                              {!imageErrors[`reported-${report.id}`] ? (
                                <Image 
                                  src={getImageUrl(report.reportedPhoto)}
                                  alt={report.reportedPrenom}
                                  width={25}
                                  height={25}
                                  className={styles.miniAvatar}
                                  onError={() => handleImageError(`reported-${report.id}`)}
                                  unoptimized
                                />
                              ) : (
                                <div className={styles.miniAvatarFallback}>
                                  <PersonIcon style={{ fontSize: 16 }} />
                                </div>
                              )}
                            </div>
                            <span>{report.reportedPrenom} {report.reportedNom}</span>
                          </div>
                        </td>
                        <td className={styles.postContentCell}>
                          {report.postContent?.substring(0, 30)}...
                        </td>
                        <td>{report.reason}</td>
                        <td>{new Date(report.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${
                            report.status === 'pending' ? styles.pending : 
                            report.status === 'resolved' ? styles.resolved : styles.rejected
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td>
                          {report.status === 'pending' && (
                            <div className={styles.reportActions}>
                              <button 
                                className={`${styles.actionBtn} ${styles.resolveBtn}`}
                                onClick={() => handleResolveReport(report.id, 'delete_post')}
                                title="Supprimer le post"
                              >
                                <DeleteIcon />
                              </button>
                              <button 
                                className={`${styles.actionBtn} ${styles.suspendBtn}`}
                                onClick={() => handleResolveReport(report.id, 'suspend_user')}
                                title="Suspendre l'utilisateur"
                              >
                                <BlockIcon />
                              </button>
                              <button 
                                className={`${styles.actionBtn} ${styles.activateBtn}`}
                                onClick={() => handleResolveReport(report.id, null)}
                                title="Rejeter"
                              >
                                <CloseIcon />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Messages privés */}
          {activeTab === 'messages' && (
            <div className={styles.messagesSection}>
              <h2>Messages privés</h2>
              <div className={styles.conversationsList}>
                {conversations.map(conv => (
                  <div key={conv.id} className={styles.conversationWrapper}>
                    <div 
                      className={`${styles.conversationCard} ${selectedConversation?.id === conv.id ? styles.selected : ''}`}
                      onClick={() => handleViewConversation(conv)}
                    >
                      <div className={styles.conversationHeader}>
                        <div className={styles.conversationUsers}>
                          <div className={styles.conversationAvatarWrapper}>
                            {!imageErrors[`conv1-${conv.id}`] ? (
                              <Image 
                                src={getImageUrl(conv.user1Photo)}
                                alt={conv.user1Prenom}
                                width={30}
                                height={30}
                                className={styles.conversationAvatar}
                                onError={() => handleImageError(`conv1-${conv.id}`)}
                                unoptimized
                              />
                            ) : (
                              <div className={styles.avatarFallbackSmall}>
                                <PersonIcon style={{ fontSize: 16 }} />
                              </div>
                            )}
                          </div>
                          <strong>{conv.user1Prenom} {conv.user1Nom}</strong>
                          <span className={styles.conversationSeparator}>↔</span>
                          <div className={styles.conversationAvatarWrapper}>
                            {!imageErrors[`conv2-${conv.id}`] ? (
                              <Image 
                                src={getImageUrl(conv.user2Photo)}
                                alt={conv.user2Prenom}
                                width={30}
                                height={30}
                                className={styles.conversationAvatar}
                                onError={() => handleImageError(`conv2-${conv.id}`)}
                                unoptimized
                              />
                            ) : (
                              <div className={styles.avatarFallbackSmall}>
                                <PersonIcon style={{ fontSize: 16 }} />
                              </div>
                            )}
                          </div>
                          <strong>{conv.user2Prenom} {conv.user2Nom}</strong>
                        </div>
                        <div className={styles.conversationMeta}>
                          <small>{new Date(conv.lastMessageAt).toLocaleString('fr-FR')}</small>
                          {selectedConversation?.id === conv.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </div>
                      </div>
                      <p className={styles.lastMessage}>{conv.lastMessageContent}</p>
                    </div>
                    
                    {selectedConversation?.id === conv.id && (
                      <div className={styles.conversationDetail}>
                        <h4>Tous les messages</h4>
                        <div className={styles.messagesThread}>
                          {conversationMessages[conv.id]?.map(msg => (
                            <div key={msg.id} className={styles.messageItem}>
                              <div className={styles.messageAvatarWrapper}>
                                {!imageErrors[`msg-${msg.id}`] ? (
                                  <Image 
                                    src={getImageUrl(msg.photo)}
                                    alt={msg.prenom}
                                    width={35}
                                    height={35}
                                    className={styles.messageAvatar}
                                    onError={() => handleImageError(`msg-${msg.id}`)}
                                    unoptimized
                                  />
                                ) : (
                                  <div className={styles.avatarFallbackSmall}>
                                    <PersonIcon style={{ fontSize: 18 }} />
                                  </div>
                                )}
                              </div>
                              <div className={styles.messageBubble}>
                                <strong>{msg.prenom} {msg.nom}</strong>
                                {msg.type === 'image' ? (
                                  <div className={styles.messageImageContainer}>
                                    <Image 
                                      src={msg.image}
                                      alt="Image du message"
                                      width={200}
                                      height={200}
                                      className={styles.messageImage}
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <p>{msg.content}</p>
                                )}
                                <small>{new Date(msg.createdAt).toLocaleString('fr-FR')}</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages de contact */}
          {activeTab === 'contact' && (
            <div className={styles.contactSection}>
              <h2>Messages de contact</h2>
              <div className={styles.contactList}>
                {contactMessages.map(msg => (
                  <div key={msg.id} className={`${styles.contactCard} ${msg.status === 'non lu' ? styles.unread : ''}`}>
                    <div className={styles.contactHeader}>
                      <div className={styles.contactSender}>
                        <strong>{msg.name}</strong>
                        <span className={styles.contactEmail}>{msg.email}</span>
                      </div>
                      <small>{new Date(msg.date).toLocaleString('fr-FR')}</small>
                    </div>
                    <h4>{msg.subject}</h4>
                    <p className={styles.contactMessage}>{msg.message}</p>
                    <div className={styles.contactActions}>
                      <span className={`${styles.statusBadge} ${
                        msg.status === 'non lu' ? styles.pending : 
                        msg.status === 'lu' ? styles.resolved : styles.rejected
                      }`}>
                        {msg.status}
                      </span>
                      <button 
                        className={styles.replyBtn}
                        onClick={() => handleReplyToContact(msg.email, msg.subject)}
                      >
                        <ReplyIcon /> Répondre
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}