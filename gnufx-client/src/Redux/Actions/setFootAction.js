import Axios from "axios";
import {config} from "../../config";
import { getImage } from "../../Utils";

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
                    if (imageNames.data[i].includes("_") && !imageNames.data[i].includes("_CLR")){//dont get the original foot images
                        var imageObj = await getImage(imageNames.data[i]);
                        imageUrls.push(imageObj);
                    }
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

/*
    Stores the selectedFoot index.
    Param data: 0 or 1 referring to left foot or right foot
*/
export const setSelectedFoot = (data) => {
    return {
        type : "SET_SELECTED_FOOT",
        payload: data
    }
}

/*
    Saves the images fetched from the server.
    In order to avoid fetching the images multiple times in different components.
    Param data: Array of images in the form [{name: "", url: ""}
*/
export const saveImages = (data) => {
    return {
        type: "SAVE_IMAGES",
        payload: data
    }
}

/*
    Saves the toe data fetched from the server.
    In order to have access to the data in different components.
    Param data: Array of toe data, format: toe-dataSchema.
*/
export const saveToeData = (data) => {
    return {
        type: "SAVE_TOE_DATA",
        payload: data
    }
}

/*
    Loads all of the user's toe images from the server and saves it to the local memory.
*/
export const getAndSaveImages = () => async (dispatch) => {
    //Recieve the images from the backend server
    let images = await GetAllImages();
    
    //saves the image urls in the redux store
    dispatch(saveImages(images));
}

/*
    Loads all of the user's toe data from the server and saves it to the local memory.
*/
export const getAndSaveToeData = () => async (dispach) => {
    let toeData = await getToeData();
    dispach(saveToeData(toeData));
}
