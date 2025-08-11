import { asyncHandler } from "../utils/asyncHandler.js";
import { Pin } from "../models/pin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js'

const createPin = asyncHandler( async (req, res)=> {
    const {title, description, destinationUrl, category} = req.body;
    if (!title || !description || !category) {
        throw new ApiError(400, "All fields are required to create a pin")
    }
    
    const pinImgLocalPath = req.file?.path;
    
    if (!pinImgLocalPath) {
        throw new ApiError(400, "Pin image is required to create a pin")
    }
    const pinImg = await uploadOnCloudinary(pinImgLocalPath)

    const pin = await Pin.create({
        pinImg: pinImg?.secure_url || "",
        title,
        description,
        destinationUrl,
        category,
        owner: req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201, pin, "Pin created successfully"))
})

const deletePin = asyncHandler( async (req, res)=> {
    const pinId = req.params.pinId
    const pin = await Pin.findById(pinId)
    
    if (pin.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "You are not authorized to delete this pin")
    }
    await Pin.findByIdAndDelete(pinId)
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Pin deleted successfully"))
})

const allPins = asyncHandler( async (req, res)=> {
    const pins = await Pin.find({})
    return res
    .status(200)
    .json(new ApiResponse(200, pins, "Pins fetched successfully"))
})

export {allPins, createPin, deletePin}