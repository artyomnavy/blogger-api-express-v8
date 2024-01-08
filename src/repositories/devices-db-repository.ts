import {devicesCollection} from "../db/db";
import {DevicesSessionsType} from "../types/device/output";

export const devicesRepository = {
    async createDeviceSession(newDeviceSession: DevicesSessionsType): Promise<DevicesSessionsType> {
        await devicesCollection
            .insertOne(newDeviceSession)
        return newDeviceSession
    },
    async updateDeviceSession(updateData: DevicesSessionsType): Promise<boolean> {
        const resultUpdateDeviceSession = await devicesCollection
            .updateOne({
                deviceId: updateData.deviceId,
                userId: updateData.userId},
                {
                    $set: {
                    iat: updateData.iat,
                    exp: updateData.exp,
                    ip: updateData.ip,
                    deviceName: updateData.deviceName
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