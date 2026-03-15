import React, { useState, useEffect, useRef } from "react";
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
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReplyIcon from "@mui/icons-material/Reply";
import WarningIcon from "@mui/icons-material/Warning";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ArticleIcon from "@mui/icons-material/Article";
import ScheduleIcon from "@mui/icons-material/Schedule";

export default function Admin({ user }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const { tab } = router.query;
    if (tab && ['dashboard', 'users', 'posts', 'reports', 'messages', 'contact'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [router.query]);

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname.includes('rencontreauthentique.org')) {
        return 'https://green-alpaca-449310.hostingersite.com';
      }
    }
    return 'http://localhost:5000';
  };

  const getImageUrl = (photo) => {
    const baseUrl = getBaseUrl();
    if (!photo) return "/default-avatar.png";
    if (photo.startsWith('http')) return photo;
    return `${baseUrl}${photo}`;
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.load();
  }, []);

  const playNotificationSound = () => {
    if (!soundEnabled || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const loadPendingPosts = async () => {
    try {
      const pendingRes = await api.get('/admin/posts/pending');
      
      if (pendingRes.length > lastNotificationCount && pendingRes.length > 0) {
        playNotificationSound();
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('📝 Nouvelle publication en attente', {
            body: `${pendingRes[0]?.prenom} ${pendingRes[0]?.nom} a publié un message`,
            icon: '/logo192.png',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            data: { url: '/admin?tab=posts' }
          });
        }
      }
      
      setLastNotificationCount(pendingRes.length);
      setPendingPosts(pendingRes);
    } catch (error) {
      console.error("❌ Erreur chargement posts en attente:", error);
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
    const interval = setInterval(loadPendingPosts, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes, convRes, contactRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/reports'),
        api.get('/admin/conversations'),
        api.get('/admin/contact-messages')
      ]);

      setStats(statsRes);
      setUsers(usersRes || []);
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

      await loadPendingPosts();
      
    } catch (error) {
      console.error("❌ Erreur chargement admin:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      await api.put(`/admin/posts/${postId}/approve`);
      setPendingPosts(pendingPosts.filter(p => p.id !== postId));
      setSuccess("✅ Publication approuvée avec succès !");
      setTimeout(() => setSuccess(""), 3000);
      playNotificationSound();
    } catch (error) {
      console.error("❌ Erreur approbation:", error);
      setError("Erreur lors de l'approbation");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Voulez-vous vraiment rejeter cette publication ?")) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      setPendingPosts(pendingPosts.filter(p => p.id !== postId));
      setSuccess("🗑️ Publication rejetée");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("❌ Erreur suppression post:", error);
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

  const filteredUsers = users.filter(u => 
    u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = pendingPosts.length;

  if (loading) {
    return <div className={styles.loading}>Chargement du portail admin...</div>;
  }

  return (
    <div className={styles.adminContainer}>
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
                className={`${styles.notificationBtn} ${totalPending > 0 ? styles.hasNotification : ''}`}
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Son activé" : "Son désactivé"}
              >
                {soundEnabled ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
                {totalPending > 0 && <span className={styles.notificationBadge}>{totalPending}</span>}
              </button>
              <button onClick={() => router.push('/')} className={styles.backToSiteBtn}>
                <HomeIcon /> Retour au site
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

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
            {totalPending > 0 && <span className={styles.badge}>{totalPending}</span>}
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
            </div>
          )}

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

          {activeTab === 'posts' && (
            <div className={styles.postsSection}>
              <div className={styles.postsHeader}>
                <h2>
                  <ArticleIcon className={styles.sectionIcon} />
                  Publications en attente
                  {totalPending > 0 && <span className={styles.pendingCount}>{totalPending}</span>}
                </h2>
                <p className={styles.postsSubtitle}>
                  {totalPending === 0 
                    ? "Aucune publication en attente d'approbation" 
                    : `${totalPending} publication${totalPending > 1 ? 's' : ''} à examiner`}
                </p>
              </div>
              
              {pendingPosts.length === 0 ? (
                <div className={styles.noPostsContainer}>
                  <div className={styles.emptyStateIcon}>
                    <HourglassEmptyIcon />
                  </div>
                  <p className={styles.noPosts}>Aucune publication en attente</p>
                  <p className={styles.noPostsSubtitle}>Les nouvelles publications apparaîtront ici</p>
                </div>
              ) : (
                <div className={styles.pendingPostsGrid}>
                  {pendingPosts.map(post => (
                    <div key={post.id} className={styles.pendingPostCard}>
                      <div className={styles.postCardHeader}>
                        <div className={styles.userInfo}>
                          <div className={styles.userAvatarLarge}>
                            {!imageErrors[`post-${post.id}`] ? (
                              <Image 
                                src={getImageUrl(post.photo)}
                                alt={post.prenom}
                                width={56}
                                height={56}
                                className={styles.userAvatarImage}
                                onError={() => handleImageError(`post-${post.id}`)}
                                unoptimized
                              />
                            ) : (
                              <div className={styles.avatarFallbackLarge}>
                                <PersonIcon />
                              </div>
                            )}
                          </div>
                          <div className={styles.userDetails}>
                            <h3 className={styles.userName}>{post.prenom} {post.nom}</h3>
                            <div className={styles.userMeta}>
                              <span className={styles.userMetaItem}>
                                <span className={styles.metaLabel}>Âge:</span> {post.age}
                              </span>
                              <span className={styles.userMetaItem}>
                                <span className={styles.metaLabel}>Ville:</span> {post.ville}
                              </span>
                              <span className={styles.userMetaItem}>
                                <span className={styles.metaLabel}>Religion:</span> {post.religion}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.postTimeBadge}>
                          <ScheduleIcon className={styles.timeIcon} />
                          <span>{new Date(post.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>
                      
                      <div className={styles.postContent}>
                        <p>"{post.content}"</p>
                      </div>
                      
                      <div className={styles.postCardFooter}>
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
                  ))}
                </div>
              )}
            </div>
          )}

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

          {activeTab === 'messages' && (
            <div className={styles.messagesSection}>
              <h2>Messages privés</h2>
              <div className={styles.conversationsList}>
                {conversations.map(conv => (
                  <div key={conv.id} className={styles.conversationWrapper}>
                    <div 
                      className={`${styles.conversationCard} ${selectedConversation?.id === conv.id ? styles.selected : ''}`}
                      onClick={() => setSelectedConversation(selectedConversation?.id === conv.id ? null : conv)}
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
                                <p>{msg.content}</p>
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
                        onClick={() => window.location.href = `mailto:${msg.email}?subject=Re: ${msg.subject}`}
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