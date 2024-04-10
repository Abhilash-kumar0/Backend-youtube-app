import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    console.log("hello")

    //TODO: create playlist
    if (!name || !description) {
        throw new ApiError(400,"Name and description is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if(!playlist){
        throw new ApiError(400,"Something went wrong while creating playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist created successfully"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId){
        throw new ApiError(400,"User id is missing")
    }
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Invalid user id")
    }
    try {
        
            const userPlayList = await Playlist.find({owner: userId})
        
            if(!userPlayList || userPlayList.length === 0){
                throw new ApiError(404,"User playlists not found")
            }
            return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    userPlayList
                    )
            )
    } catch (error) {
        throw new ApiError(500,error.message || "Internal Server Error")
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!videoId || !playlistId) {
        throw new ApiError(400,"PlayList or VideoId is missing")
    }
    try {
        
            // Update the playlist by pushing the videoId to the videos array
            const updatedPlaylist = await Playlist.findByIdAndUpdate(
                playlistId,
                { $addToSet: { videos: videoId } }, // Use $addToSet to avoid adding duplicate videos
                { new: true } // Return the updated document
            );
        
            if (!updatedPlaylist) {
                throw new ApiError(404, "Playlist not found");
            }
        
            // Send a success response
            res
            .status(200)
            .json(
                new ApiResponse(
                200, 
                "The video was added successfully to the playlist", 
                )
            );
    } catch (error) {
        throw new ApiError(500,error.message || "Internal server error");
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
