import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if(!localfilepath){
            throw new Error("Please provide the file path")
        }
        const result = await cloudinary.uploader.upload(localfilepath, {

            resource_type: "auto"
        });

        console.log("fill has been uploaded",result.url);
        return result;
    }
        catch(err){
            fs.unlinkSync(localfilepath);

            console.log(err);
        }


    }