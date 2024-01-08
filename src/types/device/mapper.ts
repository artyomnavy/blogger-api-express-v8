import {WithId} from "mongodb";
import {DevicesSessionsType, OutputDevicesSessionsType} from "./output";

export const deviceSessionMapper = (deviceSession: WithId<DevicesSessionsType>): OutputDevicesSessionsType => {
    return {
        ip: deviceSession.ip,
        title: deviceSession.deviceName,
        lastActiveDate: deviceSession.iat.toISOString(),
        deviceId: deviceSession.deviceId
    }
}