//email logic with verification code

import {mailtrapClient, sender} from '../mailtrap/mail.config.js'
import {VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE} from '../mailtrap/email-template.js'

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }]

    try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
			category: "Email Verification",
		});

		console.log("Email sent successfully", response);

    } catch (e) {
        console.log(e)
        // throw new Error("Error sending verification email", e)
    }
}

//=> Welcome page after successful verification (make new template from mailtrap website)
export const sendWelcomeEmail = async(email, name) => {
    const recipient = [{ email }]

    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "d5c3f3d0-4110-4e8a-bbe2-a720c8b0fe76",  //took from mailtrap website template section
            template_variables: {
                "company_info_name": "MERN project",
                "name": name
            }
        })

        console.log("Welcome email sent sucessfully", response)

    }catch(e){
        console.log(e)
    }
}

export const sendPwdResetEmail = async(email, resetURL) => {
    const recipient = [{ email }]

    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html : PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password reset"
        })

        //console.log(response)

    }catch(e){
        console.log(e)
    }
}

export const sendResetSuccessEmail = async(email) => {
    const recipient = [{ email }]

    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password reset successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        })

        console.log("Password reset email sent successfully", response)

    }catch(e){
        console.log(e)
    }
}
