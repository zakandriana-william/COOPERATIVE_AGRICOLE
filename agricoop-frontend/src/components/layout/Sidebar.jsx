import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',    icon: '📊', label: 'Tableau de Bord', roles: ['admin', 'gestionnaire'] },
  { to: '/membres',      icon: '👥', label: 'Membres',         roles: ['admin', 'gestionnaire'] },
  { to: '/stocks',       icon: '📦', label: 'Stocks',          roles: ['admin', 'gestionnaire'], badge: 2 },
  { to: '/recoltes',     icon: '🌽', label: 'Récoltes',        roles: ['admin', 'gestionnaire'] },
  { to: '/finances',     icon: '💰', label: 'Finances',        roles: ['admin'] },
  { to: '/profil',       icon: '👤', label: 'Mon Profil',      roles: ['membre'] },
]

const systemItems = [
  { to: '/rapports',     icon: '📄', label: 'Rapports',      roles: ['admin'] },
  { to: '/utilisateurs', icon: '🛡',  label: 'Utilisateurs', roles: ['admin'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Déconnexion réussie')
    navigate('/login')
  }

  const initiales = user
    ? `${user.nom?.[0] || ''}${user.prenom?.[0] || ''}`.toUpperCase()
    : 'U'

  const canSee = (roles) => roles.includes(user?.role)

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🌾</div>
        <div className="sidebar-logo-name">AgriCoop</div>
        <div className="sidebar-logo-sub">Coopérative Agricole</div>
      </div>

      {/* Navigation principale */}
      <div className="sidebar-section">Principal</div>
      {navItems.filter(item => canSee(item.roles)).map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
          {item.badge && <span className="nav-badge">{item.badge}</span>}
        </NavLink>
      ))}

      {/* Navigation système */}
      {systemItems.filter(item => canSee(item.roles)).length > 0 && (
        <>
          <div className="sidebar-section">Système</div>
          {systemItems.filter(item => canSee(item.roles)).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </>
      )}

      {/* User footer */}
      <div className="sidebar-user" onClick={handleLogout} title="Se déconnecter">
        <div className="user-avatar">{initiales}</div>
        <div className="user-info">
          <div className="user-name">{user?.prenom} {user?.nom}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>⏻</span>
      </div>
    </aside>
  )
}
