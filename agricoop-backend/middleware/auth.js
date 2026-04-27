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

    // ✅ Query tsotra — tsy misy JOIN na subquery
    const [rows] = await pool.query(
      `SELECT id_utilisateur AS id, nom, prenom, email, statut, id_role
       FROM utilisateurs
       WHERE id_utilisateur = ? AND statut = 'actif'`,
      [decoded.id]
    )

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Utilisateur introuvable ou suspendu.' })
    }

    // ✅ Jereo ny role avy amin'ny id_role
    const user = rows[0]
    if (user.id_role === 1) user.role = 'administrateur'
    else if (user.id_role === 2) user.role = 'gestionnaire'
    else user.role = 'membre'

    // ✅ Raha ny token misy role mivantana, mampiasa azy
    if (decoded.role) user.role = decoded.role

    req.user = user
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
