const jwt = require('jsonwebtoken')
const pool = require('../config/db')

// ── Middleware : vérifier le token JWT ──────────────────────────
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant. Veuillez vous connecter.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Vérifier que l'utilisateur existe encore en BDD
    const [rows] = await pool.query(
      'SELECT u.*, r.libelle AS role FROM utilisateurs u JOIN roles r ON u.id_role = r.id_role WHERE u.id_utilisateur = ? AND u.statut = "actif"',
      [decoded.id]
    )

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Utilisateur introuvable ou suspendu.' })
    }

    req.user = rows[0]
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée. Veuillez vous reconnecter.' })
    }
    return res.status(401).json({ message: 'Token invalide.' })
  }
}

// ── Middleware : restreindre par rôle ───────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}.`
      })
    }
    next()
  }
}

// Raccourcis
const adminOnly       = authorize('administrateur')
const adminOrGest     = authorize('administrateur', 'gestionnaire')

module.exports = { protect, authorize, adminOnly, adminOrGest }
