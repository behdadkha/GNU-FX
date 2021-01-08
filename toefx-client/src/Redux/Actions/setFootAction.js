import getAllImages from '../../utils/imageReciever';

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
    
    //recieving the images the backend server
    let images = await getAllImages();

    //remove the current user's data
    dispatch(saveImages(images));

}