/*
    General utility functions for all files.
*/

import React from "react";
import axios from "axios";

import LeftFootSymbol from './icons/leftfootlogo.png';
import RightFootSymbol from './icons/rightfootlogo.png';
import LeftFootUnshadedSymbol from './icons/LeftFootHollow.png';
import RightFootUnshadedSymbol from './icons/RightFootHollow.png';
import LeftFootToe0 from './icons/toes/LeftFootToe0.png';
import LeftFootToe1 from './icons/toes/LeftFootToe1.png';
import LeftFootToe2 from './icons/toes/LeftFootToe2.png';
import LeftFootToe3 from './icons/toes/LeftFootToe3.png';
import LeftFootToe4 from './icons/toes/LeftFootToe4.png';

//Self-commenting Ids for feet
export const LEFT_FOOT_ID = 0;
export const RIGHT_FOOT_ID = 1;
export const TOE_COUNT = 5; //5 toes on each foot

//Common names of toes
const gToeNames = ["Big Toe", "Index Toe", "Middle Toe", "Fourth Toe", "Little Toe"];

//Images for each toe when selected - flipped for right foot
const gToeImages = [LeftFootToe0, LeftFootToe1, LeftFootToe2, LeftFootToe3, LeftFootToe4]

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
    Gets an image of a foot symbol.
    param footId: 0 for left foot, 1 for right foot.
    returns: An image of a foot symbol.
*/
export function GetFootSymbolImage(footId) {
    if (footId === LEFT_FOOT_ID)
        return LeftFootSymbol;

    return RightFootSymbol;
}

/*
    Gets an image of an unshaded foot symbol (not filled in).
    param footId: 0 for left foot, 1 for right foot.
    returns: An image of a foot symbol.
*/
export function GetUnshadedFootSymbolImage(footId) {
    if (footId === LEFT_FOOT_ID)
        return LeftFootUnshadedSymbol;

    return RightFootUnshadedSymbol;
}

/*
    Gets the correct image of a foot symbol whether or not the foot is selected.
    param footId: The foot to get the image for. 0 for left foot, 1 for right foot.
    returns: An image of a foot symbol.
*/
export function GetFootSymbolByActive(footId, activeFootId) {
    if (footId == activeFootId) //This foot is selected
        return GetFootSymbolImage(footId); //Return the shaded in image
    else
        return GetUnshadedFootSymbolImage(footId);
}

/*
    Gets the image for a specific toe being highlighted.
    param toeId: A number from 0 to 4 representing a toe.
    returns: An image of a toe symbol.
*/
export function GetToeSymbolImage(footId, toeId) {
    var style = {};

    if (footId === RIGHT_FOOT_ID)
        style = {transform: "scaleX(-1)"}; //Flip horizontally

    return <img src={gToeImages[toeId]} alt={GetToeName(toeId)} style={style}/>;
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
