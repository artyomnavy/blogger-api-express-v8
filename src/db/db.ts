import {BlogsType} from "../types/blog/output";
import {PostsType} from "../types/post/output";
import {MongoClient} from "mongodb";
import dotenv from 'dotenv'
import {UsersAccountType} from "../types/user/output";
import {CommentsType} from "../types/comment/output";
import {AttemptsType, RefreshTokenType} from "../types/auth/output";
import {DevicesSessionsType} from "../types/device/output";
dotenv.config()

export const port = process.env.PORT || 5000

const mongoUri = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017'

if (!mongoUri) {
    throw new Error('Url dosen\'t found')
}

console.log(process.env.MONGO_URL)
//output - mongodb+srv://a:a@ava.epzello.mongodb.net/?retryWrites=true&w=majority

const client = new MongoClient(mongoUri)
const db = client.db('BloggerPlatform')

export const blogsCollection = db.collection<BlogsType>('blogs')
export const postsCollection = db.collection<PostsType>('posts')
export const usersCollection = db.collection<UsersAccountType>('users')
export const commentsCollection = db.collection<CommentsType>('comments')
export const devicesCollection = db.collection<DevicesSessionsType>('devices')
export const attemptsCollection = db.collection<AttemptsType>('attempts')

export const runDb = async () => {
    try {
        await client.connect()
        console.log('Client connected to DB')
        console.log(`Example app listening on port: ${port}`)
    } catch (e) {
        console.log(`${e}`)
        await client.close()
    }
}