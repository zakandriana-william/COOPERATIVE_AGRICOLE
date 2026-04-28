import { useState, useEffect } from 'react'
import { membresAPI, recoltesAPI, financesAPI } from '../../api/services'

export default function RapportsPage() {
  const [stats, setStats] = useState({
    membres: 0, recoltes: 0, finances: { recettes: 0, depenses: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const charger = async () => {
      try {
        const [m, f] = await Promise.allSettled([
          membresAPI.getAll({}),
          financesAPI.getBilan({})
        ])
        setStats({
          membres: m.status === 'fulfilled' ? m.value.data.total || 0 : 0,
          finances: {
            recettes: f.status === 'fulfilled' ? f.value.data.total_recettes || 0 : 0,
            depenses: f.status === 'fulfilled' ? f.value.data.total_depenses || 0 : 0,
          }
        })
      } catch (e) {}
      finally { setLoading(false) }
    }
    charger()
  }, [])

  const rapports = [
    { icon: '👥', titre: 'Rapport Membres',     desc: 'Liste complète des membres actifs, suspendus et leurs cotisations', color: '#4A8C3F' },
    { icon: '🌽', titre: 'Rapport Récoltes',    desc: 'Synthèse des récoltes par saison, culture et membre',              color: '#E8A020' },
    { icon: '📦', titre: 'Rapport Stocks',      desc: 'État des stocks, alertes et mouvements de la période',             color: '#2980B9' },
    { icon: '💰', titre: 'Rapport Financier',   desc: 'Bilan des recettes, dépenses et solde de la coopérative',          color: '#8E44AD' },
    { icon: '📊', titre: 'Rapport Annuel',      desc: 'Synthèse complète de toutes les activités de l\'année',            color: '#C0392B' },
    { icon: '🏆', titre: 'Top Producteurs',     desc: 'Classement des membres par rendement et production',               color: '#16A085' },
  ]

  return (
    <div className="slide-up">
      {/* KPIs */}
      <div className="kpi-row">
        {[
          { label: 'Total Membres',  value: stats.membres,              color: '#4A8C3F' },
          { label: 'Total Recettes', value: `${(stats.finances.recettes/1000).toFixed(0)}K FCFA`, color: '#2980B9' },
          { label: 'Total Dépenses', value: `${(stats.finances.depenses/1000).toFixed(0)}K FCFA`, color: '#C0392B' },
          { label: 'Solde Net',      value: `${((stats.finances.recettes - stats.finances.depenses)/1000).toFixed(0)}K FCFA`, color: '#8E44AD' },
        ].map((k, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Rapports disponibles */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📄 Rapports Disponibles</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {rapports.map((r, i) => (
              <div key={i} style={{
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 20,
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderLeft: `4px solid ${r.color}`,
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => alert('Export PDF/Excel — Bientôt disponible')}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{r.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{r.titre}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.5 }}>{r.desc}</div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" style={{ fontSize: '0.72rem', background: r.color }}>
                    📄 PDF
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.72rem' }}>
                    📊 Excel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Période */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">📅 Générer un Rapport Personnalisé</div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Date début</label>
              <input className="form-input" type="date" defaultValue="2024-01-01" />
            </div>
            <div className="form-group">
              <label className="form-label">Date fin</label>
              <input className="form-input" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label className="form-label">Type de rapport</label>
              <select className="form-select">
                <option>Rapport complet</option>
                <option>Membres uniquement</option>
                <option>Finances uniquement</option>
                <option>Stocks uniquement</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Format</label>
              <select className="form-select">
                <option>PDF</option>
                <option>Excel</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => alert('Export — Bientôt disponible')}>
            🖨️ Générer le Rapport
          </button>
        </div>
      </div>
    </div>
  )
}
