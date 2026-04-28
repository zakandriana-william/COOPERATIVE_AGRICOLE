import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard':    { title: 'Tableau de Bord',      sub: 'Dashboard' },
  '/membres':      { title: 'Gestion des Membres',  sub: 'Membres' },
  '/stocks':       { title: 'Gestion des Stocks',   sub: 'Stocks' },
  '/recoltes':     { title: 'Récoltes & Saisons',   sub: 'Récoltes' },
  '/finances':     { title: 'Gestion Financière',   sub: 'Finances' },
  '/rapports':     { title: 'Rapports & Statistiques', sub: 'Rapports' },
  '/utilisateurs': { title: 'Utilisateurs & Rôles', sub: 'Utilisateurs' },
  '/profil':       { title: 'Mon Profil',            sub: 'Profil' },
  '/register':     { title: 'Nouvel Utilisateur',   sub: 'Register' },
}

export default function Topbar({ onAdd, addLabel, onMenuToggle }) {
  const location = useLocation()
  const page = pageTitles[location.pathname] || { title: 'AgriCoop', sub: '' }

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Hamburger menu — visible uniquement sur mobile */}
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Menu">
          ☰
        </button>
        <div className="topbar-left">
          <div className="page-title">{page.title}</div>
          <div className="breadcrumb">AgriCoop / <span>{page.sub}</span></div>
        </div>
      </div>

      <div className="topbar-right">
        {onAdd && (
          <button className="btn btn-primary btn-sm" onClick={onAdd}>
            + {addLabel || 'Nouveau'}
          </button>
        )}
        <div className="notif-btn">
          🔔
          <div className="notif-dot" />
        </div>
        <button className="btn btn-ghost btn-sm">
          ⬆️ <span>Exporter</span>
        </button>
      </div>
    </header>
  )
}
