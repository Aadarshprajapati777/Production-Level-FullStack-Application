import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
            required: false
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
        role: {
            type:String,
            enum:["user", "service-provider"],
            default:"user"
        },
        isVerified: {
            type:Boolean,
            default:false
        },
    },
    
    {timestamps:true}
);
        






userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})


userSchema.methods.isPasswordCorrect = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}


userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        id:this._id,
        userName:this.userName,
        email:this.email,
        fullName:this.fullName,
    
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn:process.env.ACCESS_TOKEN_EXPIRY, algorithm:"HS256"});

}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        id:this._id
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn:process.env.ACCESS_TOKEN_EXPIRY, algorithm:"HS256"});

}


export const User = mongoose.model("User", userSchema);