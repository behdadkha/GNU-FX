/*
    General utility functions for all files.
*/

import React from "react";
import {Form} from "react-bootstrap";
import {isMobile} from "react-device-detect";
import axios from "axios";

import LeftFootSymbol from './icons/leftfootlogo.png';
import RightFootSymbol from './icons/rightfootlogo.png';
import LeftFootUnshadedSymbol from './icons/LeftFootHollow.png';
import RightFootUnshadedSymbol from './icons/RightFootHollow.png';

import LeftFootUnshadedSymbol_half from './icons/LeftFootHollowHalf.png';
import RightFootUnshadedSymbol_half from './icons/RightFootHollowHalf.png';

import LeftFootToe0 from './icons/toes/LeftFootToe0.png';
import LeftFootToe1 from './icons/toes/LeftFootToe1.png';
import LeftFootToe2 from './icons/toes/LeftFootToe2.png';
import LeftFootToe3 from './icons/toes/LeftFootToe3.png';
import LeftFootToe4 from './icons/toes/LeftFootToe4.png';
import { config } from "./config";

import CheckMark from "./icons/checkmark.png";
import CrossMark from "./icons/crossmark.png";

//Self-commenting Ids for feet
export const LEFT_FOOT_ID = 0;
export const RIGHT_FOOT_ID = 1;
export const TOE_COUNT = 5; //5 toes on each foot

//Common names of toes
const gToeNames = ["Big Toe", "Index Toe", "Middle Toe", "Fourth Toe", "Little Toe"];

//Images for each toe when selected - flipped for right foot
const gToeImages = [LeftFootToe0, LeftFootToe1, LeftFootToe2, LeftFootToe3, LeftFootToe4]

//Pages with the navigation bar at the top when using a desktop computer
const gDesktopPagesWithoutNavbar = ["/user", "/user/myAccount"];

//Pages without the navigation bar at the top when using a mobile device
const gMobilePagesWithoutNavbar = ["/login", "/signup"]

/*
    Determines if a navigation bar should appear at the top of the page.
    returns: true if the nav bar should appear, false otherwise.
*/
export function DoesPageHaveNavBar() {
    if (!isMobile) //Desktop
        return !gDesktopPagesWithoutNavbar.includes(window.location.pathname);

    return !gMobilePagesWithoutNavbar.includes(window.location.pathname);
}

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
    param halfImage: if true returns the above half of the image used for the camera overlay
    returns: An image of a foot symbol.
*/
export function GetUnshadedFootSymbolImage(footId, halfImage=false) {
    
    //left foot
    if (footId === LEFT_FOOT_ID)
        if (halfImage) return LeftFootUnshadedSymbol_half; else return LeftFootUnshadedSymbol;

    //right foot
    if (halfImage) return RightFootUnshadedSymbol_half;
    return RightFootUnshadedSymbol;
}

/*
    Gets the correct image of a foot symbol whether or not the foot is selected.
    param footId: The foot to get the image for. 0 for left foot, 1 for right foot.
    returns: An image of a foot symbol.
*/
export function GetFootSymbolByActive(footId, activeFootId) {
    if (footId === activeFootId) //This foot is selected
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
    Gets the confirmation symbols that change when the user's password satsifies the criteria.
    param password: The password the user entered so far.
    returns: JSX for the symbols.
*/
export function GetGoodPasswordConfirmations(password) {
    var checkMarkClass = "password-check-mark";

    return (
        <span>
            <Form.Label className="strong-password-desc">
                <Form.Text className="text-muted">
                    {
                        IsPasswordLengthStrong(password)
                        ? <img src={CheckMark} className={checkMarkClass} alt="OK"/>
                        : <img src={CrossMark} className={checkMarkClass} alt="NO"/>
                    }
                    {" Password must be at least 8 characters long."} {/*Writing it in a string keeps the space at the front*/}
                </Form.Text>
            </Form.Label>
            <br></br>
            <Form.Label className="strong-password-desc">
                <Form.Text className="text-muted">
                    {
                        DoesPasswordHaveUpperandLowerCase(password)
                        ? <img src={CheckMark} className={checkMarkClass} alt="OK"/>
                        : <img src={CrossMark} className={checkMarkClass} alt="NO"/>
                    }
                    {" Password must contain uppercase (A-Z) and lowercase (a-z) characters."}
                </Form.Text>
            </Form.Label>
            <br></br>
            <Form.Label >
                <Form.Text className="text-muted">
                    {
                        DoesPasswordHaveNumber(password)
                        ? <img src={CheckMark} className={checkMarkClass} alt="OK"/>
                        : <img src={CrossMark} className={checkMarkClass} alt="NO"/>
                    }
                    {" Password must contain a number (0-9)."}
                </Form.Text>
            </Form.Label>
        </span>
    );
}

/*
    Validates the input
    param input: string to be validated
    returns true if the input is acceptable, false otherwise
*/
export function IsValidInput(input) {
    return input !== undefined && input.length > 0 && input[0] !== " ";
}

/*
    Checks if a given string can actually be used as an email address.
    param email: The email address to check.
    returns: true if the email is valid, false otherwise.
*/
export function IsValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/*
    Checks if the user entered a password of required length.
    param password: The password to check.
    returns: true if the user's input password is long enough, false otherwise.
*/
export function IsPasswordLengthStrong(password) {
    return password.length >= 8; //Min 8 characters.
}

/*
    Checks if the user entered a password with both a lowercase and uppercase letter.
    param password: The password to check.
    returns: true if the user's input password has both a lowercase and uppercase letter, false otherwise.
*/
export function DoesPasswordHaveUpperandLowerCase(password) {
    return password.match(/[a-z]+/) && password.match(/[A-Z]+/);
}

/*
    Checks if the user entered a password with a number.
    param password: The password to check.
    returns: true if the user's input password has a number, false otherwise.
*/
export function DoesPasswordHaveNumber(password) {
    return password.match(/[0-9]+/);
}

/*
    Checks if the user entered a good password that can be saved for them.
    param password: The password to check.
    returns: true if the user's input password is good, false otherwise.
*/
export function IsGoodPassword(password) {
    return IsValidInput(password)
        && IsPasswordLengthStrong(password)
        && DoesPasswordHaveUpperandLowerCase(password)
        && DoesPasswordHaveNumber(password);
}

/*
    Gets the image URL for displaying it on the page.
    param imagesArray: The list of images to search through, format: {imageName: "", url: ""}.
    param name: The saved name of the image.
    returns: The url for displaying an HTML image.
*/
export function GetImageURLByName(imagesArray, name) {
    try {
        return imagesArray.find(({ imageName }) => imageName === name).url;
    }
    catch {
        return undefined;
    }
}

/*
    Gets the image from the backend server.
    param imageName: the name of the image to search for in the server
    returns a json {name: imageName, url: image url}, the image url can be fed to <img src=>
*/
export function getImage(imageName) {
    return new Promise((resolve, reject) => {
        axios.get(`${config.dev_server}/getImage?imageName=${imageName}`, { responseType: "blob" })
            .then((image) => {
                resolve({
                    imageName: imageName,
                    url: URL.createObjectURL(image.data),
                });
            }).catch(() => {console.log("Couldnt get the image"); resolve({}); });
    });
}

/*
    Rotates an image on a canvas 90 degrees.
    param canvas: The canvas the image is on.
    param left: Rotates -90 degrees if true, 90 degrees otherwise.
*/
export function RotateImage90Degrees(canvas, left) {
    var angle = (left) ? -90 : +90;
    var ctx = canvas.getContext("2d");

    //Rotate the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2); //Translate to center
    ctx.rotate((Math.PI / 180) * angle); //Need to convert from degrees into radians
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
}

/*
    Sets the authentication header.
    param token: ?
*/
export function SetAuthHeader(token) {
    if (token)
        axios.defaults.headers.common["Authorization"] = token;
    else
        delete axios.defaults.headers.common["Authorization"];
}
