import {attemptsCollection} from "../db/db";
import {AttemptsType} from "../types/auth/output";

export const authQueryRepository = {
    async getAmountOfAttempts(attempt: AttemptsType): Promise<number> {
        const amount = await attemptsCollection
            .countDocuments({ip: attempt.ip, url: attempt.url, date: {$gte: attempt.date}})
        return amount
    }
}