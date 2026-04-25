// ═══════════════════════════════════════
// RecoltesPage.jsx
// ═══════════════════════════════════════
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

const demoRecoltes = [
  { id:1, membre:'Koné Ibrahim',   culture:'Maïs',   quantite_kg:12500, superficie_ha:4.5, date_recolte:'2024-06-15', saison:'Grande Saison 2024' },
  { id:2, membre:'Diallo Mamadou', culture:'Manioc', quantite_kg:18600, superficie_ha:6.2, date_recolte:'2024-06-20', saison:'Grande Saison 2024' },
  { id:3, membre:'Traoré Fatou',   culture:'Mil',    quantite_kg:3150,  superficie_ha:2.1, date_recolte:'2024-06-22', saison:'Grande Saison 2024' },
  { id:4, membre:'Ouédraogo',      culture:'Manioc', quantite_kg:8140,  superficie_ha:3.7, date_recolte:'2024-06-25', saison:'Grande Saison 2024' },
]

const comparaison = [
  { culture:'Maïs',   saison2024:12500, saison2023:10600 },
  { culture:'Manioc', saison2024:18600, saison2023:16600 },
  { culture:'Mil',    saison2024:3150,  saison2023:3315  },
]

const rendement = (r) => (r.quantite_kg / 1000 / r.superficie_ha).toFixed(2)
const rendColor  = (v) => v >= 2.5 ? 'var(--green)' : v >= 1.5 ? 'var(--orange)' : 'var(--red)'

export function RecoltesPage() {
  const [recoltes, setRecoltes] = useState(demoRecoltes)
  const [modal, setModal] = useState(false)
  const [form,  setForm]  = useState({ membre:'', culture:'Maïs', quantite_kg:'', superficie_ha:'', date_recolte:'' })

  const totalTonnes = recoltes.reduce((acc,r)=>acc+r.quantite_kg,0)/1000

  const handleSave = () => {
    if (!form.membre || !form.quantite_kg || !form.superficie_ha) return toast.error('Tous les champs requis')
    const r = { id:Date.now(), ...form, quantite_kg:+form.quantite_kg, superficie_ha:+form.superficie_ha, saison:'Grande Saison 2024' }
    setRecoltes(prev=>[...prev,r])
    toast.success('Récolte enregistrée !')
    setModal(false); setForm({ membre:'', culture:'Maïs', quantite_kg:'', superficie_ha:'', date_recolte:'' })
  }

  return (
    <div className="slide-up">
      <div className="saison-chip">🌱 Saison active : Grande Saison 2024 · Mar – Juil 2024</div>

      <div className="kpi-row">
        {[
          { label:'Récoltes',       value: recoltes.length,       color:'var(--text)' },
          { label:'Total produit',  value: `${totalTonnes.toFixed(1)}t`, color:'var(--green)' },
          { label:'Rendement moy.', value: `${(recoltes.reduce((a,r)=>a+(+rendement(r)),0)/recoltes.length).toFixed(2)} t/ha`, color:'var(--orange)' },
          { label:'vs Saison N-1',  value: '+12%',                color:'var(--blue)' },
        ].map((k,i)=>(
          <div className="kpi-card" key={i}>
            <div className="kpi-value" style={{color:k.color}}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-32">
        <div className="card">
          <div className="card-header">
            <div className="card-title">🌽 Récoltes par Membre</div>
            <button className="btn btn-primary btn-sm" onClick={()=>setModal(true)}>+ Enregistrer</button>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead><tr><th>Membre</th><th>Culture</th><th>Quantité</th><th>Superficie</th><th>Rendement</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {recoltes.map(r=>{
                  const rv = +rendement(r)
                  return (
                    <tr key={r.id}>
                      <td className="bold">{r.membre}</td>
                      <td>{r.culture}</td>
                      <td>{(r.quantite_kg/1000).toFixed(1)} t</td>
                      <td>{r.superficie_ha} ha</td>
                      <td><span style={{fontWeight:700,color:rendColor(rv)}}>{rv} t/ha</span></td>
                      <td>{new Date(r.date_recolte).toLocaleDateString('fr-FR')}</td>
                      <td><div className="action-btn" title="Détail" onClick={()=>toast(`📊 Rendement: ${rv} t/ha`)}>📊</div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">📊 Comparaison 2024 vs 2023</div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={comparaison} margin={{top:0,right:0,left:-20,bottom:0}}>
                <XAxis dataKey="culture" tick={{fontSize:10,fill:'var(--text3)'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'var(--text3)'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{fontSize:'0.72rem',borderRadius:8,border:'1px solid var(--border)'}} formatter={v=>[`${(v/1000).toFixed(1)}t`]}/>
                <Legend wrapperStyle={{fontSize:'0.68rem'}}/>
                <Bar dataKey="saison2024" name="2024" fill="var(--green)"  radius={[3,3,0,0]}/>
                <Bar dataKey="saison2023" name="2023" fill="var(--border2)" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <Modal isOpen={modal} onClose={()=>setModal(false)} title="🌽 Enregistrer une Récolte"
        footer={<><button className="btn btn-ghost" onClick={()=>setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={handleSave}>Enregistrer</button></>}>
        <div className="form-grid">
          <div className="form-group full"><label className="form-label">Membre *</label>
            <select className="form-select" value={form.membre} onChange={e=>setForm({...form,membre:e.target.value})}>
              <option value="">-- Sélectionner --</option>
              {['Koné Ibrahim','Diallo Mamadou','Traoré Fatou','Ouédraogo Aïssata'].map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Culture *</label>
            <select className="form-select" value={form.culture} onChange={e=>setForm({...form,culture:e.target.value})}>
              {['Maïs','Manioc','Mil','Autre'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Saison</label>
            <select className="form-select"><option>Grande Saison 2024</option></select>
          </div>
          <div className="form-group"><label className="form-label">Quantité (kg) *</label>
            <input className="form-input" type="number" value={form.quantite_kg} onChange={e=>setForm({...form,quantite_kg:e.target.value})} placeholder="Ex: 12500"/>
          </div>
          <div className="form-group"><label className="form-label">Superficie (ha) *</label>
            <input className="form-input" type="number" step="0.1" value={form.superficie_ha} onChange={e=>setForm({...form,superficie_ha:e.target.value})} placeholder="Ex: 4.5"/>
          </div>
          <div className="form-group"><label className="form-label">Date récolte</label>
            <input className="form-input" type="date" value={form.date_recolte} onChange={e=>setForm({...form,date_recolte:e.target.value})}/>
          </div>
          {form.quantite_kg && form.superficie_ha && (
            <div className="form-group full">
              <div style={{background:'var(--green-light)',borderRadius:6,padding:'8px 12px',fontSize:'0.78rem',color:'var(--green)'}}>
                📊 Rendement calculé : <strong>{(form.quantite_kg/1000/form.superficie_ha).toFixed(2)} t/ha</strong>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
