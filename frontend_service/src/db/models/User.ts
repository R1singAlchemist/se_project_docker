import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ],
        unique: true
    },
    telephone: {
        type: String,
        required: [true, 'Please add a telephone number'],
        match: [
            /^(0[689]\d{8}|\+?[1-9]\d{1,14})$/,
            'Please enter a valid Thai or international phone number'
        ],
        unique: true
    },    
    role: {
        type: String,
        enum: ['user', 'admin', 'banned'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlenght: [6, 'Password must be at least 6 characters'],
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema)
export default User