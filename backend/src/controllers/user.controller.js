import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const generateAccessandRefreshTokens = async (userId) => {
  try{
    console.log("userId", userId)
    const user= await User.findById(userId);
    console.log("user", user);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false});

    return {accessToken, refreshToken};

  }catch(error){
        throw new ApiError(500, "Failed to generate tokens");
    }
}




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

   //email validation

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        throw new ApiError(400, "Invalid email address");
    }


    const existingUser = await User.findOne({
        $or: [{userName}, {email}]
    });

    console.log("existingUser", existingUser);
    if(existingUser){
        throw new ApiError(409, "User already exists");
    }

    console.log("req files", req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;


    const coverImageLocalPath = req.files?.coverImage ? req.files.coverImage[0].path : undefined;
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

    const user = await User.create({
        userName,
        email,
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",   
        password
    });

    console.log("user", user);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" 
    );

    console.log("createdUser", createdUser);
    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering user");
    }


    return res.status(201).json(new ApiResponse(201, "User registered successfully", createdUser));



});

const loginUser = asyncHandler( async(req, res) => {
        const {email, userName, password} = req.body;

        if(!userName && !email){
            throw new ApiError(400, "Please provide either email or username");
        }

        if(!password){
            throw new ApiError(400, "Password is required");
        }

        const user = await User.findOne({
            $or:[{ userName}]
        })

        console.log("email", email);
        console.log("userName", userName);

        console.log("user", user);  

        if(!user){
            throw new ApiError(401, "User Not found");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);     
        
        if(!isPasswordValid){
            throw new ApiError(401, "Invalid user credentials");
        } 


        const {accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id);
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;  
        console.log("user with accessToken and refreshToken", user);
        

        const option ={
            httpOnly:true,
            secure:true,
        }

        return res
        .status(200)
        .cookie("refreshToken", refreshToken, option)
        .cookie("accessToken", accessToken, option)
        .json(
            new ApiResponse(200, 
                
                {
                    accessToken,
                    refreshToken,
                    user: user.toJSON()

                },
                "User logged in successfully",
                
                user)
        
        );
})


const logoutUser = asyncHandler(async(req, res) => {
    const option ={
        httpOnly:true,
        secure:true,
    }


    const {user} = req;
    user.refreshToken = undefined;
    await user.save({validateBeforeSave:false});

    return res
    .status(200)
    .clearCookie("refreshToken", option)
    .clearCookie("accessToken", option)
    .json(new ApiResponse(200, "User logged out successfully"));

})


export {
    registerUser,
    loginUser,
    logoutUser
};