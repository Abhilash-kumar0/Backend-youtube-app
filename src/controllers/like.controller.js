import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

      // Check if videoId is present
      if (!videoId) {
        throw new ApiError(400, "Video ID is missing");
    }

    // Check if videoId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const userId = req.user._id;

    try {
        // Check if the user has already liked the video
        const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

        if (existingLike) {
            // User has already liked the video, so remove the like
            await Like.findByIdAndDelete(existingLike._id);
            res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Like removed successfully"
                    )
            );
        } else {
            // User has not liked the video, so add the like
            const newLike = new Like({
                video: videoId,
                likedBy: userId
            });
            await newLike.save();
            res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Like added successfully"
                )
            )
        }
    } catch (error) {
        // Handle any potential errors
        // console.error(error);
        throw new ApiError(500, error.message || "Internal Server Error");
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    // Check if commentId is present
    if (!commentId) {
        throw new ApiError(400, "Comment ID is missing");
    }

    // Check if commentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    const userId = req.user._id; 

    try {
        // Check if the user has already liked the comment
        const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

        if (existingLike) {
            // User has already liked the comment, so remove the like
            await existingLike.remove();
            res.status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                   "Like removed successfully"
                )
            );
        } 
        else {
            // User has not liked the comment, so add the like
            const newLike = new Like({
                comment: commentId,
                likedBy: userId
            });
            await newLike.save();
            res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {}, 
                    "Like added successfully"
                )
            );
        }
    } catch (error) {
        // Handle any potential errors
        // console.error(error);
        throw new ApiError(500, error.message || "Internal Server Error");
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!tweetId) {
        throw new ApiError(404, "Tweet ID id is missing")
    }
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid tweet ID")
    }

    const userId = req.user.id;

    try {
        
            const existingLike = await Like.findOne({tweet: tweetId, likedBy: userId});
            if (existingLike) {
                await existingLike.remove()
                res.status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "Like removed Successfully"
                    )
                )
        
            } 
            else {
                const newLike = await Like({Tweet: tweetId, likedBy: userId})
                await newLike.save()
                res.status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "Like add Successfully"
                    )
                )
            }
    } catch (error) {
        throw new ApiError(500, error.message || "Internal server Error!")
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id; // Assuming you have user information stored in req.user

    try {
        const likedVideos = await Like.aggregate([
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "videos", // Assuming your videos collection is named "videos"
                    localField: "video",
                    foreignField: "_id",
                    as: "video",
                    pipeline:[
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields:{
                                owner:{
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$video"
            },
            {
                $project: {
                    owner: "$video.owner",
                    _id: "$video._id",
                    tittle: "$video.tittle",
                    videoFile: "$video.videoFile",
                    description: "$video.description",
                    thumbnail: "$video.thumbnail",
                    // Add other fields you want to retrieve from the video document
                }
            }
        ]);

        console.log(likedVideos)

        res.status(200).json({ likedVideos });
    } catch (error) {
        // Handle any potential errors
        console.error(error);
        throw new ApiError(500, error.message || "Internal Server Error");
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}