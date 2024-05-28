import { DB_Name } from "../contant.js";
import mongoose from "mongoose";


const connectDB = async() => {
    try{
        const connectionInstance= await mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`);
        console.log(`\n MongoDB connect on Host ${connectionInstance.connection.host} and DB Name: ${connectionInstance.connection.name}`)
    } catch (error) {
        console.log(error)
    }

}

export default connectDB;