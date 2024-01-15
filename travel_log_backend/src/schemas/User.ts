import { model, Schema } from "mongoose";

const User = new Schema({
    username: {
        type: String,
    },
    description: {
        type: String
    },
    firstName: {
        type: String,
        required: true,
        lowercase: true

    },
    lastName: {
        type: String,
        required: true,
        lowercase: true

    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: false,
    },
    profile_pic: {
        type: Object
    },
    password: {
        type: String,
        maxLength: 1250,
        required: true
    },
    date_created: {
        type: Date,
        default: Date.now
    }
})

const UserSchema = model("TravelLogUser", User)
export default UserSchema