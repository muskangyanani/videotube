import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    videoile: {
      type: String,
      required: true,
    },
    thumbnail: {
      typr: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: True,
    },
    views: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: True,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Video = mongoose.model("Video", videoSchema);
