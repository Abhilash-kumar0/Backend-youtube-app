import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import { User} from "../models/user.models.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

   
     // Check if all required parameters are provided
    if (!page || !limit || !sortBy || !sortType || !query) {
        throw new ApiError(400,"Missing required parameters. Please provide query, sortBy and sortType")
    }
    
   try {

        //Check userId id valid or not
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(401,"Invalid userId")
        }



        // // Match stage to filter based on userId
        // const matchStageByUserId = {};
        // if (userId) {
        //     matchStageByUserId.owner = new mongoose.Types.ObjectId(userId);
        // }

        // // Additional conditions based on query
        // const matchStageByQuery = {}
        // if (query) {
        //     matchStageByQuery.$or = [
        //         { tittle: { $regex: query, $options: 'i' } },
        //         { description: { $regex: query, $options: 'i' } },
        //     ];
        // }


        // console.log(matchStageByUserId)
        // console.log(matchStageByQuery)
        // // Sort stage
        // const sortStage = {};
        // if (sortBy) {
        //     sortStage[sortBy] = sortType === 'desc' ? -1 : 1;
        // }

        // console.log(sortStage)

        // // Aggregation pipeline
        // const pipeline = [
        //     { $match: matchStageByUserId },
        //     { $match: matchStageByQuery},
        //     { $sort: sortStage },
        // ];
        
        // console.log(pipeline)


        // Use the aggregatePaginate method
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
        };

        // const result = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

        const video = await Video.aggregatePaginate(
            Video.aggregate([
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(userId),
                        $or: [
                            { tittle: { $regex: query, $options: 'i' } },
                            { description: { $regex: query, $options: 'i' } }
                        ]
                    },
                },
                // Add other stages as needed
                { $sort: {[sortBy]: sortType === 'desc' ? -1 : 1} }, // Example sorting by createdAt in descending order
            ]),
            options
        );

        res.status(200).json(
            new ApiResponse(
                200,
                video,
                "video is fetch successfully"
            )
        )
   } catch (error) {
    throw new ApiError(500,error?.message || "Internal server error!")
   }

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { tittle, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(
        [tittle,description].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400,"All fields is required")
    }


    try {
        const videoFileLocalPath = req.files?.videoFile[0]?.path
        const thumbnailFileLocalPath = req.files?.thumbnail[0]?.path
    
        //check user is provided video file or not 
        const videoFIleMimetype =req.files.videoFile[0].mimetype 
    
        if(!videoFIleMimetype.includes('video')){ 
            throw new ApiError(400,"Please provide a valid video file")
        }
    
    
        if (!videoFileLocalPath) {
            throw new ApiError(400,"video file is missing")
        }
        if (!thumbnailFileLocalPath) {
            throw new ApiError(400,"thumbnail file is missing")
        }
    
        const videoFile = await uploadOnCloudinary(videoFileLocalPath,"videoTube/videos")
        const thumbnailFile = await uploadOnCloudinary(thumbnailFileLocalPath,"videoTube/Images")
        // console.log("cloudinary",videoFile)
    
        if (!videoFile) {
            throw new ApiError(400,"video file is required")
        }
        if (!thumbnailFile) {
            throw new ApiError(400,"thumbnail file is required")
        }
    
        // console.log(req.user)
    
        const video = await Video.create({
            videoFile: videoFile.url,
            thumbnail: thumbnailFile.url,
            tittle,
            description,
            duration: videoFile?.duration || 0,
            owner: req.user?._id
        })
    
        if(!video){
            throw new ApiError(400,"Something went wrong while creating the video")
        }
    
        return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                video,
                "Video has been uploaded successfully"   
            )
        )
    
    } catch (error) {
        throw new ApiError(500,error?.message || "Internal server error!")
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!videoId){
        throw new ApiError(400,'video id is missing')
    }


    // console.log(mongoose.Types.ObjectId.isValid(videoId))

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(404,'Invalid video id')
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(500,'No video with provided ID found in database')
    }


    return res
    .status(200)
    .json(new ApiResponse(200,video,"Successfully retrieved video"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!videoId){
        throw new ApiError(400,'video id is missing')
    }

     if(!mongoose.Types.ObjectId.isValid(videoId)){
         throw new ApiError(404,'Invalid video id')
     }
     
    //  console.log(mongoose.Types.ObjectId.isValid(videoId))

     const{tittle,description} = req.body
 
     if(!tittle || !description){
         throw new ApiError(400,'Please provide tittle and description')
     }
 
     const thumbnailFileLocalPath =req.file?.path
 
     if(!thumbnailFileLocalPath){
         throw new ApiError(400,'Thumbnail file is required')
     }
     
    
     //get pervious thumbnail url from database so you can delete that from cloudinary
     const oldVideo = await Video.findOne(
         {_id:videoId},
         {thumbnail: 1}
     )
     // console.log(oldVideo)

     if(!oldVideo){
        throw new ApiError(400,"No video available for this video Id")
     }


     const thumbnailFile = await uploadOnCloudinary(thumbnailFileLocalPath,"videoTube/Images",'image')

     if (!thumbnailFile) {
        throw new ApiError(400,'Thumbnail file is required')
    }
 
     const video = await Video.findByIdAndUpdate(
         videoId,
         {
             $set:{
                 tittle,
                 description,
                 thumbnail: thumbnailFile.url
             }
         },
         {new:true}
     )

     if (!video) {
        throw new ApiError(401,"Something went wrong while updating video")
     }
 
     await deleteFromCloudinary(oldVideo.thumbnail,"videoTube/Images",'image')
 
     return res
     .status(200)
     .json(
         new ApiResponse(
             200,
             video,
             "video details updated successfully"
         )
     )
  
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) {
        throw new ApiError(400,"video Id is missing")
    }
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(401,'Invalid video Id')
    }

    const video = await Video.findByIdAndDelete(videoId)

    if (!video) {
        throw new ApiError(400,"No video found with provided video id in database")
    }

    await deleteFromCloudinary(video.videoFile,"videoTube/videos",'video')

    await deleteFromCloudinary(video.thumbnail,"videoTube/Images",'image')


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "video is deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400,"videoId is missing")
    }

    try {
        if(!mongoose.Types.ObjectId.isValid(videoId)){
            throw new ApiError(401,'Invalid video Id')
        }

        const video = await Video.findById(videoId)

        if (!video) {
            throw new ApiError(401,"No video found for video with provided video id")
        }

        video.isPublished = !video.isPublished

        const updatedVideo  = await video.save({validateBeforeSave: false})

        if(!updateVideo){
            throw new ApiError(500,"Something went wrong while togglePublishStatus")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedVideo ,
                "success"
            )
        )

    } catch (error) {
        throw new ApiError(500,error?.message || "Internal server error!")
    }

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
