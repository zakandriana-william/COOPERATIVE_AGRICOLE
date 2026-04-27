const jwt  = require('jsonwebtoken')
const pool = require('../config/db')

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant. Veuillez vous connecter.' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // ✅ mampiasa id, role, actif — marina amin'ny DB production
    const [rows] = await pool.query(
      'SELECT id, nom, prenom, email, role, actif FROM utilisateurs WHERE id = ? AND actif = 1',
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

const adminOnly   = authorize('admin')
const adminOrGest = authorize('admin', 'gestionnaire')

module.exports = { protect, authorize, adminOnly, adminOrGest }
