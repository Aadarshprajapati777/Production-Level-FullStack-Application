import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
        userName: {
            type:String,
            required:true,
            unique:true,
            trim:true,
            index:true
        },
        email: {
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true,
        },

        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar: {
            type:String,
            default:"https://res.cloudinary.com/dkkgmzpqd/image/upload/v1626073778/avatars/avatar-1_f9b4b4.png",
            required:true
        },
        coverImage: {
            type:String,
        },
        
     watchHistory: [
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
     ],

     password: {
         type:String,
         required:[true, "Password is required"],
     },
     refreshToken: {
         type:String,
     },
     timestamps: true


})


export const User = mongoose.model("User", userSchema);