export type DevicesSessionsType = {
    iat: Date,
    exp: Date,
    ip: string,
    deviceId: string,
    deviceName: string,
    userId: string
}

export type OutputDevicesSessionsType = {
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string
}