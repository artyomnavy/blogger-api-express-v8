import {Response, Request, Router} from "express";
import {HTTP_STATUSES} from "../utils";
import {usersService} from "../domain/users-service";
import {RequestWithBody} from "../types/common";
import {AuthLoginModel} from "../types/auth/input";
import {authLoginValidation} from "../middlewares/validators/auth-validator";
import {jwtService} from "../application/jwt-service";
import {authBearerMiddleware, authRefreshTokenMiddleware} from "../middlewares/auth/auth-middleware";
import {usersQueryRepository} from "../repositories/users-db-query-repository";
import {
    userConfirmEmailValidation,
    userRegistrationCodeValidation,
    userValidation
} from "../middlewares/validators/users-validator";
import {CreateUserModel} from "../types/user/input";
import {authService} from "../domain/auth-service";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns/add";
import {devicesService} from "../domain/devices-service";
import {attemptsMiddleware} from "../middlewares/auth/attempts-middleware";

export const authRouter = Router({})

authRouter.post('/login',
    attemptsMiddleware,
    authLoginValidation(),
    async (req: RequestWithBody<AuthLoginModel>, res: Response) => {
        const {
            loginOrEmail,
            password
        } = req.body

        const deviceId = uuidv4()
        const ip = req.ip! || 'unknown'
        const deviceName = req.headers['user-agent'] || 'unknown'

        const user = await usersService
            .checkCredentials({loginOrEmail, password})

        if (!user) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
            return
        } else {
            const userId = user._id.toString()

            const accessToken = await jwtService
                .createAccessJWT(userId)

            const refreshToken = await jwtService
                .createRefreshJWT(deviceId, userId)

            const payloadRefreshToken = await jwtService
                .getPayloadByToken(refreshToken)

            const iat = new Date(payloadRefreshToken.iat * 1000)
            const exp = new Date(payloadRefreshToken.exp * 1000)

            await devicesService
                .createDeviceSession({iat, exp, ip, deviceId, deviceName, userId})

            res
                .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
                .status(HTTP_STATUSES.OK_200).send({accessToken: accessToken})
        }
    })

authRouter.post('/refresh-token',
    authRefreshTokenMiddleware,
    async (req: Request, res: Response) => {
        const userId = req.userId!
        const deviceId = req.deviceId!

        const newIp = req.ip! || 'unknown'
        const newDeviceName = req.headers['user-agent'] || 'unknown'

        const newAccessToken = await jwtService
            .createAccessJWT(userId)

        const newRefreshToken = await jwtService
            .createRefreshJWT(deviceId, userId)

        const newPayloadRefreshToken = await jwtService
            .getPayloadByToken(newRefreshToken)

        const newIat = new Date(newPayloadRefreshToken.iat * 1000)
        const newExp = new Date(newPayloadRefreshToken.exp * 1000)

        const isUpdateDeviceSession = await devicesService
            .updateDeviceSession({
                iat: newIat,
                exp: newExp,
                ip: newIp,
                deviceId: deviceId,
                deviceName: newDeviceName,
                userId: userId
            })

        if (isUpdateDeviceSession) {
            res
                .cookie('refreshToken', newRefreshToken, {httpOnly: true, secure: true})
                .status(HTTP_STATUSES.OK_200).send({accessToken: newAccessToken})
        }
    })

authRouter.post('/logout',
    authRefreshTokenMiddleware,
    async (req: Request, res: Response) => {
        const userId = req.userId!
        const deviceId = req.deviceId!

        const isTerminateDeviceSession = await devicesService
            .terminateDeviceSessionByLogout(deviceId, userId)

        if (isTerminateDeviceSession) {
            res
                .clearCookie('refreshToken')
                .sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    })

authRouter.post('/registration',
    attemptsMiddleware,
    userValidation(),
    async (req: RequestWithBody<CreateUserModel>, res: Response) => {
        const {
            login,
            password,
            email
        } = req.body

        const user = await authService
            .createUserByRegistration({login, password, email})

        if (!user) {
            res.status(HTTP_STATUSES.IM_A_TEAPOT_418).send('Confirm code don\'t sended to passed email address, try later')
            return
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/registration-confirmation',
    attemptsMiddleware,
    userRegistrationCodeValidation(),
    async(req: RequestWithBody<{code: string}>, res: Response) => {
        const code = req.body.code

        await authService
            .confirmEmail(code)

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/registration-email-resending',
    attemptsMiddleware,
    userConfirmEmailValidation(),
    async(req: RequestWithBody<{email: string}>, res: Response) => {
        const email = req.body.email
        const newCode = uuidv4()
        const newExpirationDate = add(new Date(), {
            minutes: 10
        })

        const isUpdated = await authService
            .updateConfirmationCode(email, newCode, newExpirationDate)

        if (isUpdated) {
            await authService
                .resendingEmail(email, newCode)
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    })

authRouter.get('/me',
    authBearerMiddleware,
    async (req: Request, res: Response) => {

        const authMe = await usersQueryRepository
            .getUserByIdForAuthMe(req.userId!)

        res.send(authMe)
    })