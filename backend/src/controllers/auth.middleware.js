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
     console.log("token", token);    
 
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
 
     if(!user){
         throw new ApiError(401, "Unauthorized");
     }
 
     console.log("user", user);
     req.user = user;
     console.log("user  alsjflaj:  ", user);
     next();
 
   } catch (error) {
    throw new ApiError(403, "invalid access token")
    
   }

});


export {verifyJWT};