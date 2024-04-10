import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, folderName) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary with the specified folder
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folderName, // Specify the folder name
    });

    // Check if the file has been uploaded successfully
    if (response) {
      fs.unlinkSync(localFilePath);
      return response;
    } else {
      console.error('Error while uploading file to Cloudinary:', response.result);
      return null;
    }
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error('Error uploading file to Cloudinary:', error.message);
    return null;
  }
};


const deleteFromCloudinary = async (url, folderName, resourceType) => {
  const publicId = `${folderName}/${url?.split('/').pop().split('.')[0]}`;

  try {
      if (!publicId) {
          console.error('Invalid publicId:', publicId);
          return null;
      }

      console.log('Deleting file from Cloudinary - publicId:', publicId, 'folderName:', folderName);

      // Delete the file on Cloudinary with the specified folder and resource type
      const deletionResult = await cloudinary.uploader.destroy(publicId, {
          folder: folderName, // Specify the folder name
          resource_type: resourceType, // Specify the resource type ('image' or 'video')
      });

      console.log('Cloudinary Deletion Result:', deletionResult);

      // Check the delete result
      if (deletionResult.result === 'ok') {
          console.log('File deleted successfully from Cloudinary');
          return deletionResult;
      } else {
          console.error('Error while deleting file from Cloudinary:', deletionResult);
          return null;
      }
  } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      return null;
  }
};



export { uploadOnCloudinary, deleteFromCloudinary };
