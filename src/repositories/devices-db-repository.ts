import {devicesCollection} from "../db/db";
import {DevicesSessionsType} from "../types/device/output";

export const devicesRepository = {
    async createDeviceSession(newDeviceSession: DevicesSessionsType): Promise<DevicesSessionsType> {
        await devicesCollection
            .insertOne(newDeviceSession)
        return newDeviceSession
    },
    async updateDeviceSession(deviceId: string, userId: string, iat: Date, exp: Date): Promise<boolean> {
        const resultUpdateDeviceSession = await devicesCollection
            .updateOne({deviceId: deviceId, userId: userId}, {
                $set: {
                    iat: iat,
                    exp: exp
                }
            })
        return resultUpdateDeviceSession.matchedCount === 1
    },
    async terminateDeviceSessionByLogout(deviceId: string, userId: string): Promise<boolean> {
        const resultTerminateDeviceSession = await devicesCollection
            .deleteOne({deviceId: deviceId, userId: userId})
        return resultTerminateDeviceSession.deletedCount === 1
    },
    async terminateAllOthersDevicesSessions(userId: string, deviceId: string): Promise<boolean> {
        const resultTerminateAllOthersDevicesSessions = await devicesCollection
            .deleteMany({
                userId: userId,
                deviceId: {
                    $ne: deviceId
                }
            })
        return resultTerminateAllOthersDevicesSessions.deletedCount === 1
    },
    async terminateDeviceSessionById(deviceId: string): Promise<boolean> {
        const resultTerminateDeviceSession = await devicesCollection
            .deleteOne({deviceId: deviceId})
        return resultTerminateDeviceSession.deletedCount === 1
    }
}