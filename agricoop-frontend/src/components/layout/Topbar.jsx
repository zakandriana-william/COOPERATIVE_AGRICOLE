import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const pageMeta = {
  '/dashboard':    { title: 'Tableau de Bord',        bc: 'Dashboard' },
  '/membres':      { title: 'Gestion des Membres',    bc: 'Membres' },
  '/stocks':       { title: 'Gestion des Stocks',     bc: 'Stocks' },
  '/recoltes':     { title: 'Gestion des Récoltes',   bc: 'Récoltes' },
  '/finances':     { title: 'Gestion Financière',     bc: 'Finances' },
  '/rapports':     { title: 'Rapports & Statistiques',bc: 'Rapports' },
  '/utilisateurs': { title: 'Utilisateurs & Rôles',   bc: 'Utilisateurs' },
  '/profil':       { title: 'Mon Profil',              bc: 'Profil' },
}

export default function Topbar({ onAdd, addLabel = '+ Ajouter' }) {
  const { pathname } = useLocation()
  const meta = pageMeta[pathname] || { title: 'AgriCoop', bc: '' }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div>
          <div className="page-title">{meta.title}</div>
          <div className="breadcrumb">
            AgriCoop / <span>{meta.bc}</span>
          </div>
        </div>
      </div>
      <div className="topbar-right">
        <div
          className="notif-btn"
          onClick={() => toast('⚠️ 2 alertes de stock critique')}
          title="Notifications"
        >
          🔔 <div className="notif-dot" />
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => toast('📤 Export en cours...')}
        >
          📤 Exporter
        </button>
        {onAdd && (
          <button className="btn btn-primary btn-sm" onClick={onAdd}>
            {addLabel}
          </button>
        )}
      </div>
    </div>
  )
}
