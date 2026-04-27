const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/authController')

router.post('/register',        ctrl.register)
router.post('/login',           ctrl.login)
router.get ('/me',              ctrl.getMe)
router.post('/reset-password',  ctrl.resetPassword)

module.exports = router
