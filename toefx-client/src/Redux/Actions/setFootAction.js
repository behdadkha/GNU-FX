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

/*
    Gets all the user's toe data from the backend server.
    returns: the user's toe data stored in an array.
*/
async function getToeData(){
    let toeData = [];

    await Axios.get(`${config.dev_server}/getToe`)
        .then((data) => {
            toeData = data.data;
        });
    
    return toeData;
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

export const saveToeData = (data) => {
    return {
        type: "SAVE_TOE_DATA",
        payload: data
    }
}

export const getAndSaveImages = () => async (dispatch) => {
    //Recieve the images from the backend server
    let images = await GetAllImages();

    //saves the image urls in the redux store
    dispatch(saveImages(images));
}

export const getAndSaveToeData = () => async (dispach) => {
    let toeData = await getToeData();
    dispach(saveToeData(toeData));
}
