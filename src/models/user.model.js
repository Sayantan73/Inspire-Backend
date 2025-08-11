import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        maxLength: [128, "Full name must be less than 128 characters"],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        maxLength: [128, "Email must be less than 128 characters"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String,
    },
    savedPins: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pin"
        }
    ],
    avatar: {
        type: String,
    },
    address: {
        type: String,
        maxLength: [256, "Address must be less than 256 characters"],
    },
    about: {
        type: String,
        maxLength: [256, "About must be less than 256 characters"],
    },
    phoneNumber: {
        type: Number,
    },
    website: {
        type: String,
        maxLength: [128, "Website must be less than 128 characters"],
    },

}, {timestamps: true});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
})

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRETS,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRETS,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema);

