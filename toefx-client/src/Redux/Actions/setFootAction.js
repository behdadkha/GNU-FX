import Axios from "axios";
import { config } from "../../config";

/*
    Gets all of the user's uploaded images.
    returns: The user's images stored in an array.
*/
async function GetAllImages() {
    let imageUrls = [];

    await Axios.get(`${config.dev_server}/getImageNames`)
        .then(async (imageNames) => {
            //Get all the user's images and store them in a data array
            for (let i = 0; i < imageNames.data.length; i++) {
                await Axios.get(`${config.dev_server}/getImage?imageName=${imageNames.data[i]}`, { responseType: "blob" })
                    .then((image) => {
                        imageUrls.push({ imageName: imageNames.data[i], url: URL.createObjectURL(image.data) });
                    });
            }
        });

    return imageUrls;
}


export const setSelectedFoot = (data) => {
    return {
        type : "SET_SELECTED_FOOT",
        payload: data
    }
}

export const saveImages = (data) => {
    return {
        type: "SAVE_IMAGES",
        payload: data
    }
}

export const getAndSaveImages = () => async (dispatch) => {
    //Recieve the images from the backend server
    let images = await GetAllImages();

    //Remove the current user's data
    dispatch(saveImages(images));
}
