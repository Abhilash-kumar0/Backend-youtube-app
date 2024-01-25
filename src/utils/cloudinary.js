import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        //console.log("file is uploaded on cloudinary ", response.url);
        if(response){
            fs.unlinkSync(localFilePath)
            return response;
        }else{
            console.error('Error while uploading image from Cloudinary:', response.result);
            return null;
        }

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async (url) => {

    const publicId = url?.split('/').pop().split('.')[0]

    try {
      if (!publicId) return null;
  
      // Delete the image on Cloudinary
      const deletionResult = await cloudinary.uploader.destroy(publicId);
  
      // Check the delete result
      if (deletionResult.result === 'ok') {
        // console.log('Image deleted successfully from Cloudinary');
        return deletionResult;
      } else {
        // console.error('Error while deleting image from Cloudinary:', deletionResult.result);
        return null;
      }
    } catch (error) {
    //   console.error('Error deleting image from Cloudinary:', error.message);
      return null;
    }
  };
  

export {uploadOnCloudinary,deleteFromCloudinary}