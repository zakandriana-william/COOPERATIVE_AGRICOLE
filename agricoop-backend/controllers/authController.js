const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const pool    = require('../config/db')

// Génère un token JWT
const genToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// ── POST /api/auth/register ─────────────────────────────────────
const register = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body
    if (!nom || !prenom || !email || !password)
      return res.status(400).json({ message: 'Tous les champs sont requis.' })

    if (password.length < 8)
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' })

    // Vérifier email unique
    const [existing] = await pool.query('SELECT id_utilisateur FROM utilisateurs WHERE email = ?', [email])
    if (existing.length > 0)
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' })

    // Hasher le mot de passe
    const hash = await bcrypt.hash(password, 12)

    // Rôle "membre" par défaut
    const [roles] = await pool.query('SELECT id_role FROM roles WHERE libelle = "membre"')
    if (roles.length === 0)
      return res.status(500).json({ message: 'Rôle "membre" introuvable en BDD.' })

    const id_role = roles[0].id_role

    const [result] = await pool.query(
      'INSERT INTO utilisateurs (id_role, nom, prenom, email, mot_de_passe) VALUES (?, ?, ?, ?, ?)',
      [id_role, nom, prenom, email, hash]
    )

    res.status(201).json({
      message: 'Compte créé avec succès.',
      id: result.insertId,
    })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// ── POST /api/auth/login ────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email et mot de passe requis.' })

    // Chercher l'utilisateur avec son rôle
    const [rows] = await pool.query(
      `SELECT u.*, r.libelle AS role
       FROM utilisateurs u
       JOIN roles r ON u.id_role = r.id_role
       WHERE u.email = ?`,
      [email]
    )

    if (rows.length === 0)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })

    const user = rows[0]

    if (user.statut === 'suspendu')
      return res.status(403).json({ message: 'Votre compte est suspendu. Contactez l\'administrateur.' })

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.mot_de_passe)
    if (!isMatch)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })

    const token = genToken(user.id_utilisateur, user.role)

    // Ne pas renvoyer le mot de passe hashé
    const { mot_de_passe, ...userSafe } = user

    res.json({
      message: 'Connexion réussie.',
      token,
      user: {
        id:     userSafe.id_utilisateur,
        nom:    userSafe.nom,
        prenom: userSafe.prenom,
        email:  userSafe.email,
        role:   userSafe.role,
        statut: userSafe.statut,
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// ── GET /api/auth/me ────────────────────────────────────────────
const getMe = async (req, res) => {
  const { mot_de_passe, ...userSafe } = req.user
  res.json({ user: userSafe })
}

// ── POST /api/auth/reset-password ──────────────────────────────
const resetPassword = async (req, res) => {
  // En production : envoyer un email avec nodemailer
  const { email } = req.body
  const [rows] = await pool.query('SELECT id_utilisateur FROM utilisateurs WHERE email = ?', [email])
  // On répond toujours "OK" pour ne pas exposer si l'email existe
  res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' })
}

module.exports = { register, login, getMe, resetPassword }
