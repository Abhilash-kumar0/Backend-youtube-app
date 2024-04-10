import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!channelId) {
        throw new ApiError(400,"channel id is missing")
    }

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400,"channel id is not valid")
    }
    
    const subscriberId = req.user._id

   try {
     const existingSubscription = await Subscription.findOne (
         {"channel": channelId , 
         "subscriber": subscriberId}
     )
 
     if (existingSubscription) {
         // Subscription already exists, so delete it (unsubscribe)
         await existingSubscription.remove();
         res.status(200).json({ message: "Unsubscribed successfully" });
     } 
     else {
         // Subscription does not exist, so create it (subscribe)
         const newSubscription = new Subscription({
             subscriber: subscriberId,
             channel: channelId,
         });
 
         await newSubscription.save();
         res.status(200).json({ message: "Subscribed successfully" });
     }
   } catch (error) {
        throw new ApiError(500,error.message || "Internal Server Error");
   }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(400,"channel Id is missing")
    }

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,'Invalid Channel ID')
    }
    try {
        const subscribers = await Subscription.aggregate([
            {
                $match: {
                    channel: mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $lookup: {
                    from: "users", 
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscriberDetails"
                }
            },
            {
                $unwind: "$subscriberDetails"
            },
            {
                $project: {
                    _id: "$subscriberDetails._id",
                    username: "$subscriberDetails.username",
                    email: "$subscriberDetails.email",
                    // Add other fields you want to retrieve from the user document
                }
            }
        ]);

        res.status(200).json({ subscribers });
    } catch (error) {
        // Handle any potential errors
        // console.error(error);
        throw new ApiError(500, error.message || "Internal Server Error");
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    // Check if subscriberId is present
    if (!subscriberId) {
        throw new ApiError(400, "Subscriber ID is missing");
    }

    // Check if subscriberId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID");
    }

    try {
        const subscribedChannels = await Subscription.aggregate([
            {
                $match: {
                    subscriber: mongoose.Types.ObjectId(subscriberId)
                }
            },
            {
                $lookup: {
                    from: "users", 
                    localField: "channel",
                    foreignField: "_id",
                    as: "channelDetails"
                }
            },
            {
                $unwind: "$channelDetails"
            },
            {
                $project: {
                    _id: "$channelDetails._id",
                    username: "$channelDetails.username",
                    email: "$channelDetails.email",
                }
            }
        ]);

        res.status(200).json({ channels: subscribedChannels });
    } catch (error) {
        // Handle any potential errors
        console.error(error);
        throw new ApiError(500, "Internal Server Error");
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}