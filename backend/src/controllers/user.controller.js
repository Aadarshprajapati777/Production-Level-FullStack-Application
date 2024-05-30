import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

    const { userName, email, fullName, password } = req.body;
    if(
        [userName, email, fullName, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "Please fill in all fields");
    }

    if(password.length < 6){
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    if(email.indudes("@") === false){
        throw new ApiError(400, "Invalid email address");
    }


    const existingUser = await User.findOne({
        $or: [{userName}, {email}]
    });
    if(existingUser){
        throw new ApiError(409, "User already exists");
    }

    console.log("req files", req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    console.log("avatarLocalPath", avatarLocalPath);
    console.log("coverImageLocalPath", coverImageLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : undefined;


    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    const user = User.create({
        userName,
        email,
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",   
        password
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" 
    );

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering user");
    }


    return res.status(201).json(new ApiResponse(201, "User registered successfully", createdUser));



});



export {registerUser};