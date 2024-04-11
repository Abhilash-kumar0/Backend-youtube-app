import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

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

    if (!playlistId) {
        throw new ApiError(400,"Playlist ID is missing")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404,"Playlist not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {playlist},
            "playlist fetch successfully"
        )
    )

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
                {},
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

    if(!playlistId || !videoId){
        throw new ApiError(400,"videoId or playlistId is missing")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: { videos: videoId }
    }, { new: true });

    if(!playlist){
        throw new ApiError(400,"Invalid video or playlist ID")
    }
    res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "video remove from playlist successfully"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(200,"playlistId is missing")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist){
        throw new ApiError(404,"Invalid playlistId")
    }
    res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!playlistId){
        throw new ApiError(200,"videoId is missing")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $set:{
            name: name,
            description: description
        }
    }, { new: true });

    if(!updatedPlaylist){
        throw new ApiError(404,"playlist not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {updatedPlaylist},
            "playlist updated successfully"
        )
    )

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
