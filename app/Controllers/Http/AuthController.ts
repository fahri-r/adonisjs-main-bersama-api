import Mail from '@ioc:Adonis/Addons/Mail'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import OtpCode from 'App/Models/OtpCode'
import User from 'App/Models/User'
import LoginValidator from 'App/Validators/LoginValidator'
import OtpVerificationValidator from 'App/Validators/OtpConfirmationValidator'
import RegisterValidator from 'App/Validators/RegisterValidator'

export default class AuthController {

    /**
    * @swagger
    * /api/v1/register:
    *   post:
    *     tags:
    *       - Auth
    *     summary: register new user
    *     requestBody:
    *       required: true
    *       content:
    *           application/x-www-form-urlencoded:
    *               schema:
    *                   $ref: '#definitions/Register'
    *           application/json:
    *               schema:
    *                   $ref: '#definitions/Register'
    *     responses:
    *       201:
    *         description: registration success
    *       422:
    *         description: some of fields may not be filled
    */
    public async register({ request, response }: HttpContextContract) {
        const payload = await request.validate(RegisterValidator)
        const otp_code = Math.floor(100000 + Math.random() * 900000)
        await Mail.send((message) => {
            message
                .from('admin@mainbersama.com')
                .to(payload.email)
                .subject('OTP Verification')
                .htmlView('emails/otp_verification', { otp_code, name: payload.name })
        })

        const user = await User.create(payload)
        await OtpCode.create({ otpCode: otp_code, userId: user.id })

        return response.created({ message: 'register success, please verify your otp code' })
    }

    /**
    * @swagger
    * /api/v1/login:
    *   post:
    *     tags:
    *       - Auth
    *     summary: login
    *     requestBody:
    *       required: true
    *       content:
    *           application/x-www-form-urlencoded:
    *               schema:
    *                   $ref: '#definitions/Login'
    *           application/json:
    *               schema:
    *                   $ref: '#definitions/Login'
    *     responses:
    *       200:
    *         description: login success
    *       400:
    *         description: invalid credentials
    */
    public async login({ request, response, auth }: HttpContextContract) {
        try {
            const payload = await request.validate(LoginValidator)
            const token = await auth.use('api').attempt(payload.email, payload.password, {
                expiresIn: '12hours'
            })

            return response.ok({ message: 'login success', data: token })
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    /**
    * @swagger
    * /api/v1/otp-confirmation:
    *   post:
    *     tags:
    *       - Auth
    *     summary: otp code confirmation
    *     requestBody:
    *       required: true
    *       content:
    *           application/x-www-form-urlencoded:
    *               schema:
    *                   $ref: '#definitions/OtpConfirmation'
    *           application/json:
    *               schema:
    *                   $ref: '#definitions/OtpConfirmation'
    *     responses:
    *       200:
    *         description: otp code valid
    *       404:
    *         description: invalid otp code or email
    */
    public async otpConfirmation({ request, response }: HttpContextContract) {
        const payload = await request.validate(OtpVerificationValidator)
        let user = await User.query()
            .where('email', payload.email)
            .andWhereHas('otpCode', (otpQuery) => {
                otpQuery.where('otp_code', payload.otp_code)
            })
            .firstOrFail()
        user.isVerified = true
        await user.save()

        return response.ok({ message: 'your OTP code valid, verification success' })
    }
}
