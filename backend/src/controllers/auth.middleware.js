import asyncHandler from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';

const verifyJWT = asyncHandler(async(req, _, next) => {
   try {
     const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "");
     if(!token){
         throw new ApiError(401, "Unauthorized");
     }
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
     console.log("decodedToken", decodedToken);
     
     const user = await User.findById(decodedToken?.id).select("-password -refreshToken");
     console.log("user", user);
     if(!user){
         throw new ApiError(401, "Unauthorized");
     }
 
     req.user = user;

     next();
 
   } catch (error) {
    throw new ApiError(403, "invalid access token")
    
   }

});


export {verifyJWT};