import axios from "axios";

/*
    General utility functions for all files.
*/

//Self-commenting Ids for feet
export const LEFT_FOOT_ID = 0;
export const RIGHT_FOOT_ID = 1;
export const TOE_COUNT = 5; //5 toes on each foot

//Common names of toes
const gToeNames = ["Big Toe", "Index Toe", "Middle Toe", "Fourth Toe", "Little Toe"];

/*
    Gets the name of a foot.
    param footId: 0 for left foot, 1 for right foot.
    returns: The name of the foot.
*/
export function GetFootName(footId) {
    if (footId === LEFT_FOOT_ID)
        return "Left";

    return "Right";
}

/*
    Gets the name of a toe.
    param toeId: A number from 0 to 4 representing a toe.
    returns: The name of the toe.
*/
export function GetToeName(toeId) {
    if (toeId >= TOE_COUNT) //Error handling
        return "Error";

    return gToeNames[toeId];
}

/*
    Validates the input
    param input: string to be validated
    returns true if the input is acceptable, false otherwise
*/
export function isValidInput(input) {
    if (input === undefined || input.length === 0 || input[0] === " ")
        return false
    return true
}

export function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/*
    Gets the image URL for displaying it on the page.
    param imagesArray: The list of images to search through, format: {imageName: "", url: ""}.
    param name: The saved name of the image.
    returns: The url for displaying an HTML image.
*/
export function GetImageURLByName(imagesArray, name) {
    console.log(name);
    try {
        return imagesArray.find(({ imageName }) => imageName === name).url;
    }
    catch {
        return undefined;
    }
}

export function SetAuthHeader(token) {
    if (token)
        axios.defaults.headers.common["Authorization"] = token;
    else
        delete axios.defaults.headers.common["Authorization"];
}
