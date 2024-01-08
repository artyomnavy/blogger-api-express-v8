import {devicesRepository} from "../repositories/devices-db-repository";
import {DevicesSessionsType} from "../types/device/output";


export const devicesService = {
    async createDeviceSession(inputData: DevicesSessionsType) {
        const newDeviceSession = {
            iat: inputData.iat,
            exp: inputData.exp,
            ip: inputData.ip,
            deviceId: inputData.deviceId,
            deviceName: inputData.deviceName,
            userId: inputData.userId
        }
        const createdDeviceSession = await devicesRepository
            .createDeviceSession(newDeviceSession)

        return createdDeviceSession
    },
    async updateDeviceSession(deviceId: string, userId: string, iat: Date, exp: Date): Promise<boolean> {
        return await devicesRepository
            .updateDeviceSession(deviceId, userId, iat, exp)
    },
    async terminateDeviceSessionByLogout(deviceId: string, userId: string): Promise<boolean>{
        return await devicesRepository
            .terminateDeviceSessionByLogout(deviceId, userId)
    },
    async terminateAllOthersDevicesSessions(userId: string, deviceId: string): Promise<boolean>{
        return await devicesRepository
            .terminateAllOthersDevicesSessions(userId, deviceId)
    },
    async terminateDeviceSessionById(deviceId: string): Promise<boolean>{
        return await devicesRepository
            .terminateDeviceSessionById(deviceId)
    },
}
