import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // validation
  if (
    [fullname, username, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist !");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(404, "Avatar file is missing !");
  }

  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // let coverImage = "";
  // if (coverLocalPath) {
  //   coverImage = await uploadOnCloudinary(coverLocalPath);
  // }

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Uploaded avatar: ", avatar);
  } catch (error) {
    console.log("Error uploading avatar: ", error);
    throw new ApiError(500, "Failed to upload avatar !");
  }

  let coverImage;
  try {
    coverImage = await uploadOnCloudinary(coverLocalPath);
    console.log("Uploaded coverImage: ", coverImage);
  } catch (error) {
    console.log("Error uploading coverImage: ", error);
    throw new ApiError(500, "Failed to upload coverImage !");
  }

  try {
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "SOmething went worng while regestring the user!"
      );
    }
    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered succesfully"));
  } catch (error) {
    console.log("User creation failed: ", error);
    if (avatar) {
      deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage) {
      deleteFromCloudinary(coverImage.public_id);
    }
    throw new ApiError(
      500,
      "Something went worng while regestring the user and images were deleted!"
    );
  }
});

export { registerUser };
