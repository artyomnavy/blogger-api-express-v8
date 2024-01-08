import {AttemptsType} from "../types/auth/output";
import {attemptsCollection} from "../db/db";

export const authRepository = {
    async addAttempt(attempt: AttemptsType): Promise<AttemptsType> {
        await attemptsCollection
            .insertOne(attempt)

        return attempt
    }
}