//import axios from "axios";

/*
    General utility functions for all files.
*/

const gToeNames = ["Big Toe", "Index Toe", "Middle Toe", "Fourth Toe", "Little Toe"];

/*
    Gets the name of a foot.
    param footId: 0 for left foot, 1 for right foot.
    returns: The name of the foot.
*/
export function GetFootName(footId) {
    if (footId === 0)
        return "Left";

    return "Right";
}

/*
    Gets the name of a toe.
    param toeId: A number from 0 to 4 representing a toe.
    returns: The name of the toe.
*/
export function GetToeName(toeId) {
    if (toeId >= GetToeCount()) //Error handling
        return "Error";

    return gToeNames[toeId];
}

/*
    Gets the number of toes on a foot.
    returns: The number of toes on a foot.
*/
export function GetToeCount() {
    return 5; //5 toes on each foot
}


/*
    Gets the image URL for displaying it on the page.
    param urls: The list of URLs to search through.
    param name: The saved name of the image.
    returns: The url for displaying an HTML image.
*/
export function GetImageSrcByURLsAndName(urls, name) {
    return urls.find(({imageName}) => imageName === name).url;
}

/*export function SetAuthHeader(token) {
    if (token)
        axios.defaults.headers.common["Authorization"] = token;
    else
        delete axios.defaults.headers.common["Authorization"];
}*/
