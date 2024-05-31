import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content){
        throw new ApiError(200,"content is missing")
    }

    const contentId = req.user?._id

    const tweet = await Tweet.create(
        {
            owner : contentId ,
            content
        })
    
    if(!tweet){
        throw new ApiError(404,"Invalid request")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "tweet created successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.params.userId;

    // Find tweets associated with the specified user ID
    const tweets = await Tweet.find({ owner: userId });

    return res.status(200).json(
        new ApiResponse(
            200,
            {tweets},
            "tweets fetch successfully "
        )
    );
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const tweetId = req.params.tweetId; // Assuming the tweet ID is provided in the request parameters
    const { content } = req.body; // Assuming the updated content is provided in the request body

    try {
        // Find the tweet by its ID and update its content
        const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, { content }, { new: true });

        // Check if the tweet exists
        if (!updatedTweet) {
            return res.status(404).json({ message: 'Tweet not found' });
        }

        // Return the updated tweet as the response
        res.status(200).json({ message: 'Tweet updated successfully', tweet: updatedTweet });
    } catch (error) {
        console.error('Error updating tweet:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const tweetId = req.params.tweetId;
    if(!tweetId){
        throw new ApiError(200,"tweet Id is missing")
    } 

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deleteTweet){
        throw new ApiError(404,"Invalid tweet Id")
    }

    res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "tweet is deleted successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
