import {User} from '../model/User.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import {generateTokenAndSetCookie} from '../utils/generateTokenAndSetCookie.js'
import {sendVerificationEmail, sendWelcomeEmail, sendPwdResetEmail, sendResetSuccessEmail} from '../mailtrap/emails.js'

//=> Register an new user
export const registerController = async (req, res) => {

    try {
        const { name, email, password } = req.body

        try {
            if (!name || !email || !password) {
                throw new Error("All fields are required")
            }

            const checkExistingUser = await User.findOne({ email })

            if (checkExistingUser) {
                res.status(400).json({
                    success: false,
                    message: "User already exist! Try to do login"
                })
            }

            //hash password 
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            //generate verification token
            const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()  //It will create 6 digit token in email for user verifiation

            const user = new User({    //create new user with token generated in email
                name,
                email,
                password: hashedPassword,
                verificationToken,
                verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000  // token is valid for 24 hr
            })

            await user.save()

            //=> after registration, jwt token will be send to user's mail account

            //genetare token with cookies
            generateTokenAndSetCookie(res, user._id)

            //send verification token in email id
            await sendVerificationEmail(user.email, verificationToken)

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                user: {
                    ...user._doc,
                    password: undefined,
                }
            })

        } catch (e) {
            res.status(400).json({
                status: false,
                message: e.message
            })
        }

    } catch (e) {
        console.log("Error", e)
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}

//=> Verify an user
export const verifyMailController = async (req, res) => {

    try {
        const { code } = req.body           //verification code(6 digit): postman body ma 'code' argument j pass akro

        try {
            const user = await User.findOne({
                verificationToken: code,
                verificationTokenExpiresAt: { $gt: Date.now() } //to check token is expired or not
            })

            if (!user) {
                return res.status(400).json({
                    success: false,
                    messsage: "Invalid or expired verification code"
                })
            }

            //else part: verified true thai jase, pachi token value & expire value ni need nathi, so undefined apo
            user.isVerified = true
            user.verificationToken = undefined
            user.verificationTokenExpiresAt = undefined

            await user.save()

            await sendWelcomeEmail(user.email, user.name)

            res.status(201).json({
                success: true,
                message: "Verified successfully",
                user: {
                    ...user._doc,
                    password: undefined
                }
            })

        } catch (e) {
            res.status(400).json({
                success: false,
                message: "Something went wrong!"
            })
        }

    } catch (e) {
        console.log("Error", e)
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}

//=> Login user
export const loginController = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exist!"
            })
        }

        const isPwdMatching = await bcrypt.compare(password, user.password)

        if (!isPwdMatching) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials!"
            })
        }

        generateTokenAndSetCookie(res, user._id)

        user.lastLogin = new Date()

        await user.save()

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (e) {
        console.log("Error", e)
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}

//=> Log out user: 
export const logoutController = async (req, res) => {

    //clear all cookies which stored for token in 'utils' folder 
    res.clearCookie("token")   //from 'utils' .js file
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}

//=> Forgot password
export const forgotPwdController = async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            res.status(400).json({
                success: false,
                message: "User doesn't exit, give valid mail id"
            })
        }

        //generate reset toekn
        const resetToken = crypto.randomBytes(20).toString("hex")      //new token with 20 digits mix of hex
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000   //new token valid for 1hr

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = resetTokenExpiresAt

        await user.save()

        //send email 
        await sendPwdResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)

        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email"
        })

    } catch (e) {
        console.log("Error", e)
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}

//=> Reset password 
export const resetPwdController = async (req, res) => {
    try {
        const { token } = req.params
        const { password } = req.body

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            })
        }

        //update password 
        const salt = await bcrypt.genSalt(10)
        const newHashedPwd = await bcrypt.hash(password, salt)

        user.password = newHashedPwd,
        user.resetPasswordToken = undefined,
        user.resetPasswordExpiresAt = undefined

        await user.save()       //store updated password in database

        await sendResetSuccessEmail(user.email)

        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        })

    } catch (e) {
        console.log("Error", e)
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}

//=> Authentication
export const checkAuth = async(req, res) => {
    try{

        const user = await User.findById(req.userId).select("-password")

        if(!user){
            return res.status(400).json({
                status: false,
                message: "User not found"
            })
        }

        res.status(200).json({
            status: true,
            user
        })

    }catch(e){
        console.log("Error", e)
        res.status(500).json({
            success: false,
            message: "Something went wrong!"
        })
    }
}
