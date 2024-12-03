import express from 'express'
import {registerController, verifyMailController, loginController, logoutController, forgotPwdController, resetPwdController, checkAuth} from '../controller/auth-controller.js'
import {verifyToken} from '../middleware/verifyToken.js'

const router = express.Router()

router.get('/check-auth', verifyToken, checkAuth)

router.post("/register", registerController)

router.post('/verify-email', verifyMailController)

router.post("/login", loginController)

router.post("/logout", logoutController)

router.post('/forgot-password', forgotPwdController)

router.post('/reset-password/:token', resetPwdController)

export default router