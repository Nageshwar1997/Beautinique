import { ObjectId, Types } from "mongoose"

type UserType = {
    _id: Types.ObjectId,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    profileImage?: string,
    role?: string
}