import {WithId} from "mongodb";
import {devicesCollection} from "../db/db";
import {OutputDevicesSessionsType, DevicesSessionsType} from "../types/device/output";
import {deviceSessionMapper} from "../types/device/mapper";

export const devicesQueryRepository = {
    async checkDeviceSession(userId: string, deviceId: string): Promise<boolean> {
        const checkDeviceSession: WithId<DevicesSessionsType> | null = await devicesCollection
            .findOne({userId: userId, deviceId: deviceId})

        if (checkDeviceSession) {
            return true
        } else {
            return false
        }
    },
    async getAllDevicesSessionsForUser(userId: string): Promise<OutputDevicesSessionsType[]> {
        const devicesSessions = await devicesCollection
            .find({userId: userId}).toArray()
        return devicesSessions.map(deviceSessionMapper)
    },
    async getDeviceSessionById(deviceId: string): Promise<WithId<DevicesSessionsType> | null> {
        const deviceSession: WithId<DevicesSessionsType> | null = await devicesCollection
            .findOne({deviceId: deviceId})

        if (deviceSession) {
            return deviceSession
        } else {
            return null
        }
    }
}