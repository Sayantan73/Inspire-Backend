import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

// Options for setting cookies
const cookieOptions = {
    httpOnly: true,
    secure: true
}

// Generate access and refresh tokens for a user
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error)
        throw new ApiError(500, "Token generation failed");
    }
}

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    // Check if all fields are filled
    if ([fullName, email, password].some(item => item?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    // Create a new user
    const user = await User.create({ fullName, email, password });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    // Return the created user
    return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"));
})

// Log in a user
const logInUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if all fields are filled
    if ([email, password].some(item => item?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if password is valid
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Return the logged in user and set cookies
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
})

// Log out a user
const logOutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } }, { new: true });
    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})

const currentUser = asyncHandler( async(req, res)=> {
    return res
    .status(200)
    .json(new ApiResponse(200, req?.user, "Current User fetched successfully"));
} )

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get the refresh token from cookies or request body
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Token not found");
    }

    try {
        // Verify the incoming refresh token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRETS);
        if (!decodedToken) {
            throw new ApiError(401, "Invalid token");
        }

        // Find the user by ID from the decoded token
        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(401, "User not found");
        }

        // Check if the refresh token matches the user's stored token
        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token used or expired");
        }

        // Generate new access and refresh tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        // Set cookies and send response
        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(200, accessToken, "Access token refreshed successfully"));

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid token");
    }
})

const getSavedPins = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "pins",
                localField: "savedPins",
                foreignField: "_id",
                as: "savedPins",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                // $first: "$owner",
                                $arrayElemAt: ["$owner", 0]
                            }
                        }
                    }
                ]
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200, user[0]?.savedPins, "Saved pins fetched successfully"));
})

export { registerUser, logInUser, logOutUser, refreshAccessToken, currentUser, getSavedPins };
