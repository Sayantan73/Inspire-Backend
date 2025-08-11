import mongoose, { Schema } from "mongoose";

const pinSchema = new mongoose.Schema({
  pinImg: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: [128, "Title must be less than 128 characters"],
  },
  description: {
    type: String,
    maxLength: [512, "Description must be less than 512 characters"],
  },
  destinationUrl: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: [
      "Photography",
      "Wallpapers",
      "Technology",
      "Design",
      "Websites",
      "Coding",
      "Fantasy",
      "Abstract",
      "Minimalism",
      "Music",
      "Sports",
      "Gaming",
      "Fitness",
      "Travel",
      "Cooking",
      "Nature",
      "Space",
      "Food",
      "Quotes",
      "Pet",
      "Cars",
      "Art",
      "Other",
    ],
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
}, { timestamps: true });

export const Pin = mongoose.model("Pin", pinSchema);


