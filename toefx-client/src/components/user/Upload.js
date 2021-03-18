/*
    Class for uploading images and diagnosing them after upload.
*/

import React, { Component } from "react";
import { Button, Container, Col, Row } from "react-bootstrap";
import { connect } from "react-redux";
import axios from "axios";
import { config } from "../../config";
import { isMobile } from "react-device-detect";

import "../../componentsStyle/Upload.css"
import "../../componentsStyle/Upload-Mobile.css"
import { TOE_COUNT, LEFT_FOOT_ID, RIGHT_FOOT_ID, GetFootSymbolByActive, GetUnshadedFootSymbolImage, getImage } from "../../Utils";
import leftFootLogo from '../../icons/leftfootlogo.png';
import rightFootLogo from '../../icons/rightfootlogo.png';
import cameraIcon from '../../icons/cameraIcon.png';
import galleryIcon from '../../icons/galleryIcon.png';
import rotateRight_icon from '../../icons/rotateRight_icon.png';
import rotateLeft_icon from '../../icons/rotateLeft_icon.png';



import Camera from './Camera.js';


const gPossibleFileTypes = ["image/x-png", "image/png", "image/bmp", "image/jpeg"];

//TODO: Add submit button and confirmation after user uploads image
//TODO: Image shouldn't be saved to database until it's validated.
//TODO: Saving a temp file name is bad because what if the user uploads two images and then tries to diagnose the first?
//TODO: Diagnose button needs to inform user of ongoing diagnosis.


class Upload extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            input: "Upload", //The name of the file uploaded
            uploaded: false, //No file is uploaded to start
            files: [], //Currently uploaded files {imageObject: ,url: ,valid:false, text:""}
            diagnosis: [], //List of {image: 0, text:""}
            decomposedImages: [], //the decomposed images from the uploaded foot image {name: imageName, url:"blob", cords: [x,y] keepClicked: false, saved: false, selectedToeId}
            uploadProgress: 0, //Percentage of upload of image completed
            tempfileName: "", //Helper with processing image
            foot: "", //The foot name the image is for. Sent to /uploadimage endpoint
            toe: "", //The toe name the image is for
            selectedFootId: -1, //The index of the foot the user selected
            selectedToeId: -1, //The index of the toe the user selected
            showChooseFootAndToeError: false, //Helps display and error if either a foot or toe is not chosen
            invalidFileTypeError: false, //Helps display an error if the user tried uploading a non-image file
            calculatingFungalCoverage: false, //User clicks on the save button and the loading message "Calculating fungal coverage" is displayed
            showUploadButton: true,
            alreadySelectedToes: [false, false, false, false, false], //to keep track of the selected toes, to prevent the user from saving multiple toenils as one toe.
            cameraOpen: false, //to see if the camera is still open or not
            showUplodConfirmation: false, // if true shows two button for either accepting the image for upload or discarding it 
        };
        this.uploadedImgRef = React.createRef();// reference to the uploaded image, used for rotating the image
        this.validateImage = this.validateImage.bind(this); //Save for later use
    }

    //Diagnosis is accessible from the homepage without being required to login
    /*
    componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            this.props.history.push("./Login");
    }
    */

    /*
        User is leaving this page
        need to request the backend server to delte the unsaved images
        cant use this.state.decomposedImages need to pass it as an argument
        param decomposedImages: this.state.decomposedImages, array of json, format [{name: "", url: "", keepClicked: false, saved: false}]
    */
    async remove_Unsaved_Images(decomposedImages) {

        let imagesToDelete = [];
        for (let i = 0; i < decomposedImages.length; i++) {

            //user did not save the image
            if (decomposedImages[i].saved === false) {
                let imageName = decomposedImages[i].imageName;
                imagesToDelete.push(imageName);
            }
        }

        //requesting to delete the images
        if (imagesToDelete.length > 0)
            await axios.delete(`${config.dev_server}/upload/deleteImage?images=${imagesToDelete}`)
                .then(() => {
                    console.log("removed all unsaved images");
                })
                .catch((error) => console.log(error));

    }

    /*
        Handles when the back button is pressed.
        param e: Back event.
    */
    onBackButtonEvent(e) {
        e.preventDefault();
        window.location.reload(); //Reload the page to potentially remove the nav bar (if the new page doesn't have it)
    }

    /*
        Helps with back button functionality on page load.
    */
    componentDidMount() {
        if (!this.props.auth.isAuth) {
            window.location.href = "/Login";
            return;
        }
        window.onpopstate = this.onBackButtonEvent.bind(this);
        //making sure the unsaves images get deleted
        window.addEventListener('beforeunload', (() => this.remove_Unsaved_Images(this.state.decomposedImages)), false);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.remove_Unsaved_Images, false)
    }

    /*
        Updates the properties of the images in memory depending on the result of the image validation.
        param res: The result of the image validation.
    */
    processImageValidationResult(res) {
        if (res.data === undefined)
            return

        var valid, text;
        var currentImageIndex = this.state.files.length - 1;
        var tempFiles = this.state.files; //A copy so setState can be used later
        var response = res.data;
        response = response.trim();
        valid = response === "toe";

        if (valid)
            text = "Upload success!"
        else
            text = "Please upload a valid image of a toe."

        //Save new validation
        tempFiles[currentImageIndex].valid = valid;
        tempFiles[currentImageIndex].text = text;
        this.setState({ files: tempFiles });
    }

    /*
        Prints an error to the console if an error occurred during image validation
        param error: The error to print.
    */
    printFileValidationErrorToConsole(error) {
        console.log("Error validating file: ");
        console.log(error);
    }

    /*
        Checks if the image is a valid image of a toe.
        param file: The file to check.
    */
    validateImage(file) {
        this.setState({ tempfileName: file }); //Used later if the user decides to run a diagnosis

        if (this.props.auth.isAuth) { //If the user is logged in, the image is loaded from the database
            axios.get(`${config.dev_server}/imagevalidation/loggedin`)
                .then(res => this.processImageValidationResult(res))
                .catch((error) => this.printFileValidationErrorToConsole(error));
        }
        else { //If the user isn't logged in, the file has to be passed in manually
            axios.post(`${config.dev_server}/imagevalidation/notloggedin`, { myimg: file })
                .then(res => this.processImageValidationResult(res))
                .catch((error) => this.printFileValidationErrorToConsole(error));
        }
    }

    /*
        recieves the image from the server and returns it 
    */
    /*async getImage(imageName) {
        await axios.get(`${config.dev_server}/getImage?imageName=${imageName}`, { responseType: "blob" })
            .then((image) => {
                return {
                    name: imageName,
                    url: URL.createObjectURL(image.data),
                    keepClicked: false,
                    saved: false,
                    selectedToeId: -1
                }
            });

    }*/

    /*
        sorts the decomposed images based on the cordinates(from left to right) taken from the original image
    */
    order_decomposedImages_leftToRight() {
        
        let temp = this.state.decomposedImages;
        
        if (temp.length > 1) {
            temp.sort((a, b) => a.cord[0] - b.cord[0])
            this.setState({
                decomposeImage: temp
            })
        }

    }

    /*
        initiates nail decompose(extracts nails from the uploaded foot image)
        fills the decomposedImages state variable with the recieved data from the server
    */
    async decomposeImage() {
        //1. request the backend to decompose the image
        //2. change the upload msg text

        await axios.get(`${config.dev_server}/upload/decompose`)
            .then(async res => {
                //res has data: {imagesInfo: [{name: "", cord: [x,y], color: [r,g,b]}], CLRImage: "name_CLR.png", fungalCoverage: "0%"}

                if (res.data.imagesInfo.length === 0) {
                    var tempFile = this.state.files[0];
                    tempFile.text = "Could not find any Toe nail. Click on either toe to restart."
                    this.setState({ files: [tempFile] })
                    return;
                }

                //Format: res.data.imagesInfo[{name: "", cord: [x,y], color: [r,g,b]}]
                var images = [];
                var promises = res.data.imagesInfo.map(async ({ name, cord, color, fungalCoverage }) => {
                    var imageObj = await getImage(name);
                    //add the additional info to the imageobj
                    imageObj["cord"] = cord;
                    imageObj["color"] = color;
                    imageObj["keepClicked"] = false;
                    imageObj["saved"] = false;
                    imageObj["selectedToeId"] = -1;
                    imageObj["fungalCoverage"] = fungalCoverage;
                    images.push(imageObj);
                });

                //wait for the map to finish
                Promise.all(promises).then(() => {
                    //set the state and orders the images
                    console.log(images)
                    this.setState(
                        { decomposedImages: images },
                        () => {
                            //call the order function right after the state is set to order the images
                            this.order_decomposedImages_leftToRight();
                        }
                    )
                });
                

                //get the new image with box around the toes
                let coloredImage_Blob = "";//new image with boxes around toes
                await axios.get(`${config.dev_server}/getImage?imageName=${res.data.CLRImage}`, { responseType: "blob" })
                    .then((image) => {
                        coloredImage_Blob = image.data;
                    });

                let tempFiles = this.state.files;
                tempFiles[0].text = "Please Choose the toe nails you would like to save";
                tempFiles[0].imageObject = coloredImage_Blob;
                tempFiles[0].url = URL.createObjectURL(coloredImage_Blob);
                
                this.setState({
                    files: tempFiles
                }, () => {
                    var canvas = this.uploadedImgRef.current;
                    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);//clear the canvas
                    this.drawImageOnCanvas_fromImgObj(coloredImage_Blob, true)  // draw the image, after the files variable is saved
                }
                )
            })
            .catch((error) => this.printFileValidationErrorToConsole(error));
    }

    /*
        Updates the upload status during a file upload.
        param progressEvent: An object containing the current state of the upload.
    */
    updateUploadProgress(progressEvent) {
        if (progressEvent.loaded <= 0 || progressEvent.total <= 0)
            return
        let progress = Math.round((progressEvent.loaded / progressEvent.total) * 100) + "%";
        this.setState({ uploadProgress: progress });
    }

    /*
        Processes the requested upload of an image by the user.
        param e: The upload event.
    */
    async handleUpload() {

        var file = this.state.files[0];
        file.text = "Processing your image..."
        this.setState({
            showUplodConfirmation: false,
            files: [file]
        });

        file = file.imageObject;

        //Now that the file has been confirmed, upload it to the database -- THIS SHOULD COME AFTER VALIDATION!!!
        const formData = new FormData(); //formData contains the image to be uploaded
        formData.append("file", file);
        formData.append("foot", this.state.selectedFootId);
        formData.append("toe", this.state.selectedToeId);

        if (this.props.auth.isAuth) { //User is logged in

            axios.post(`${config.dev_server}/upload/loggedin`, formData, {

                onUploadProgress: (ProgressEvent) => this.updateUploadProgress(ProgressEvent)

            }).then(() => {

                console.log("Done, now validating the image")
                this.decomposeImage();
                //this.validateImage(file);

            });
        }

    }

    handleOpenCamera_mobile() {
        //hide the upload button and open camera
        this.setState({ showUploadButton: false, cameraOpen: true });

    }
    /*
        The "go back" button is clicked to discard the image
        remove the image and go back to show both options(gallery and camera)
    */
    handleGoBack_discardUpload() {
        this.setState({ showUploadButton: true, files: [] });
    }

    /*
        Diagnoses one of the user's uploaded images.
        param index: The index of the file in the system to diagnose (files[index]).
    */
    handleDiagnose = async (index) => {
        var responseText = "";

        //The image name is sent as a query string imageName=
        if (this.props.auth.isAuth) {
            if (this.state.files[index] === undefined || this.state.files[index].name === undefined)
                return;

            let imageName = this.state.files[index].name;
            await axios.get(`${config.dev_server}/diagnose/loggedin/?imageName=${imageName}`)
                .then((res) => { responseText = res.data })
        }
        else {
            //tempfilename would have been set earlier
            let imageName = this.state.tempfileName;
            if (imageName === "")
                return
            await axios.get(`${config.dev_server}/diagnose/notloggedin/?imageName=${imageName}`)
                .then((res) => { responseText = res.data })
        }

        this.setState({
            diagnosis: [
                ...this.state.diagnosis, //Add the new diagnosis on to the end
                { image: index, text: responseText, diagnosisButton: true },
            ],
        });
    };

    /*
        Checks if the user choose both a foot and toe parameter for their uploaded image.
        returns: True if the user chose a foot and a toe, false otherwise.
    */
    isParamNotSet() {
        return this.state.selectedFootId === -1; //|| this.state.selectedToeId === -1;
    }

    /*
        Sets the chosen foot in the system to the user's chosen foot and resets the page.
    */
    setFoot(footId) {
        if (footId === 0 || footId === 1) {
            var tempDecomposedImages = this.state.decomposedImages;
            this.setState({
                selectedFootId: footId,//selected  ---> the rest is for reseting the page
                input: "Upload",
                uploaded: false,
                files: [],
                diagnosis: [],
                decomposedImages: [],
                uploadProgress: 0,
                tempfileName: "",
                foot: "",
                toe: "",
                selectedToeId: -1,
                showChooseFootAndToeError: false,
                invalidFileTypeError: false,
                calculatingFungalCoverage: false,
                showUploadButton: true,
                alreadySelectedToes: [false, false, false, false, false],
                cameraOpen: false,
                showUplodConfirmation: false,

            });
            //remove the unsaved images from the server
            this.remove_Unsaved_Images(tempDecomposedImages);
        }
    }

    /*
        Sets the chosen toe in the system to the user's chosen toe.
    */
    setToe(toeId) {
        if (toeId >= 0 && toeId <= 4)
            this.setState({ selectedToeId: toeId });
    }

    /*
        removes the discarded image from decomposedImages
        param index: array index to be removed
    */
    async decomposedImagesRemove(index) {
        let tempImages = this.state.decomposedImages;
        let imageName = tempImages[index].imageName;

        if (index > -1) {
            tempImages.splice(index, 1);
        }
        console.log(imageName)
        await axios.delete(`${config.dev_server}/upload/deleteImage?images=${imageName}`)
            .then(res => {
                console.log("removed");
                this.setState({
                    decomposedImages: tempImages
                });
                //refresh the page if the user discarded all the images
                if (tempImages.length === 0) {
                    window.location.reload();
                }
            })
            .catch((error) => console.log(error));

    }

    /*
        sets the saved value of an specific image inside the decomposedImages state variable to true
        param index: array index
    */
    setImageSavedToTrue(index) {
        let tempImages = this.state.decomposedImages;
        if (index > -1) {
            tempImages[index].saved = true;
        }
        this.setState({
            decomposedImages: tempImages,
            calculatingFungalCoverage: false,
        });
    }

    /*
        sets the keepClicked value of an specific image inside the decomposedImages state variable to true
        param index: decomposedImages array index
    */
    setImage_KeepClicked_ToTrue(index) {
        let tempImages = this.state.decomposedImages;
        if (index > -1) {
            tempImages[index].keepClicked = true;
        }
        this.setState({
            decomposedImages: tempImages
        });
    }

    /*
        Prints one of the buttons the user can press to select a toe.
        These two functions are similar to the one found in User.js, but they are distinct
        in the fact that they control their state differently. They do use shared CSS,
        however, to avoid code duplication.
        param toeId: The toe the button is for.
        param active: Make the button darker if active is true
        param decomposeImageIndex: the button are getting printed for this image, need this to set the selectedToeId
    */
    printToeButton(toeId, active, decomposeImageIndex) {
        var defaultToeButtonClass = "uploadToes" + toeId;
        var activeToeButtonClass = defaultToeButtonClass + " active-toe-button"; //When the toe's data is being shown on the chart


        var isDisabled = this.state.alreadySelectedToes[toeId];
        var buttonClassName = (active ? activeToeButtonClass : defaultToeButtonClass)
        return (
            <div key={toeId} style={{ display: "inline" }} className={`divToe${toeId}`}>
                <button onClick={
                    () => {
                        this.setToe(toeId)
                        this.setDecomposeImage_toeId(toeId, decomposeImageIndex)
                    }
                }
                    className={buttonClassName}
                    disabled={isDisabled}
                >
                </button>
            </div>
        );
    }

    /*
        sets the selectedToeId of the decomposedImage with index decomposeImageIndex to the toeId
        param toeId: the value to set the selectedToeId to
        param decomposeImageIndex: the index for the target decomposedImage
    */
    setDecomposeImage_toeId(toeId, decomposeImageIndex) {
        var temp = this.state.decomposedImages;
        temp[decomposeImageIndex].selectedToeId = toeId;
        this.setState({ decomposedImages: temp })
    }

    /*
        Adds buttons to the page where user can select toes.
    */
    printToeButtons(decomposeImageIndex) {
        var toeOrder = [];
        for (let i = 0; i < TOE_COUNT; ++i)
            toeOrder.push(i); //Initial view in order of ids (based on right foot)

        if (this.state.selectedFootId === LEFT_FOOT_ID)
            toeOrder.reverse(); //Toes go in opposite order on left foot


        return (
            <span className="toolbar">
                {
                    toeOrder.map((toeId) => this.printToeButton(toeId, this.is_decomposedImage_selectedToeId_true(toeId, decomposeImageIndex), decomposeImageIndex))
                }
            </span>
        );
    }

    /*
        returns true if the decomposedImage[decomposeImageIndex].selectedToeId == toeid
        to see which toeId is selected, in order to make it active
    */
    is_decomposedImage_selectedToeId_true(toeId, decomposeImageIndex) {
        return toeId === this.state.decomposedImages[decomposeImageIndex].selectedToeId;
    }

    /*
        Draws the image on canvas
        converts the imageobject to image and draws it on the canvas
        param imageObject: blob, recieved from the input field, e.target.files[0]
        param set_width_height: if true, set the canvas width and height
    */
    drawImageOnCanvas_fromImgObj(imageObject, set_width_height) {
        var reader = new FileReader();
        reader.readAsDataURL(imageObject);

        reader.onload = (e) => {
            var img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                var ctx = this.uploadedImgRef.current.getContext("2d");
                //if it is the first time, we need to set the width hand height of canvas based on the image
                if (set_width_height) {
                    this.uploadedImgRef.current.width = img.width;
                    this.uploadedImgRef.current.height = img.height;
                }

                ctx.drawImage(img, 0, 0);
                ctx.save();
            }
        };
    }

    /*
        shows the two buttons for confirming or discarding images
        checks the input file to be valid
    */
    ImageUploadConfirmation(imageObject, imageName = "default.jpg", cameraUsed = false) {


        let file = imageObject;

        if (gPossibleFileTypes.findIndex(item => item === file.type) === -1) {
            //Invalid file type
            this.setState({ invalidFileTypeError: true });
            return;
        }
        else {
            //Remove the error in case it was there before
            this.setState({ invalidFileTypeError: false });
        }

        //draw the image on canvas
        //need to convert the imageobject to Image() in order to be able to draw it on canvas
        this.drawImageOnCanvas_fromImgObj(imageObject, true);

        var newStateItems =
        {
            files: [
                ...this.state.files, //Append new image onto end of old file list
                { imageObject: imageObject, url: URL.createObjectURL(file), name: imageName, valid: false, text: '' },
            ],
            uploaded: true,
            input: imageName,

            showUploadButton: false, //hide the upload related buttons and show confirmation buttons
            showUplodConfirmation: true
        }
        //if camera is used
        if (cameraUsed) {
            newStateItems["cameraOpen"] = false;
        }
        this.setState(newStateItems);

        if (cameraUsed)
            this.handleUpload(); //image taken by camera has already had confirmation, upload it
    }

    /*  
        prints the upload button for mobile view
        shows camera and different design
    */
    printUploadButton_mobile(buttonClassName) {
        return (
            <Row>
                <Col>
                    <div className="centred-text-with-margin-above">

                        <div>
                            {/* Label must be used instead of Button because of the input field required */}
                            <label className={buttonClassName}
                                htmlFor={!this.isParamNotSet() ? "inputGroupFile01" : ''}
                                onClick={this.isParamNotSet() ? () =>
                                    this.setState({ showChooseFootAndToeError: true })
                                    : () => {
                                        this.handleOpenCamera_mobile();
                                        this.setState({ showChooseFootAndToeError: false })
                                    }

                                }
                            >
                                Camera
                                <img className="cameraIcon" src={cameraIcon} alt="camera"></img>
                            </label>

                            <input
                                type="file"
                                className="custom-file-input"
                                id="inputGroupFile01"
                                aria-describedby="inputGroupFileAddon01"
                                accept="image/x-png,image/png,image/jpeg,image/bmp"
                                //onChange={e => this.handleUpload(e.target.files[0], e.target.files[0].name)}
                                onChange={e => this.ImageUploadConfirmation(e.target.files[0], e.target.files[0].name, false)}

                            />
                        </div>
                        <label className={buttonClassName}
                            htmlFor={!this.isParamNotSet() ? "inputGroupFile01" : ''}
                            onClick={this.isParamNotSet() ? () =>
                                this.setState({ showChooseFootAndToeError: true })
                                : () =>
                                    this.setState({ showChooseFootAndToeError: false })
                            }
                        >
                            Gallery
                            <img className="galleryIcon" src={galleryIcon} alt="camera"></img>
                        </label>
                    </div>
                </Col>
            </Row>
        )
    }
    /*
        Displays the upload button
        param buttonClassName: className for the upload Button.
        returns the jsx code for the upload button
    */
    printUploadButton_desktop(buttonClassName) {
        return (
            <Row>
                <Col>
                    <div className="centred-text-with-margin-above">
                        <div>
                            {/* Label must be used instead of Button because of the input field required */}
                            <input
                                type="file"
                                className="custom-file-input"
                                id="inputGroupFile01"
                                aria-describedby="inputGroupFileAddon01"
                                accept="image/x-png,image/png,image/jpeg,image/bmp"
                                onChange={e => this.ImageUploadConfirmation(e.target.files[0], e.target.files[0].name, false)}
                            />

                            <label className={buttonClassName}
                                htmlFor={!this.isParamNotSet() ? "inputGroupFile01" : ''}
                                onClick={this.isParamNotSet() ? () =>
                                    this.setState({ showChooseFootAndToeError: true })
                                    : () =>
                                        this.setState({ showChooseFootAndToeError: false })
                                }
                            >
                                Upload
                            </label>
                        </div>
                    </div>
                </Col>
            </Row>
        )
    }

    /*
        sends a request to the backend to save the image

        param imageIndex: images's index in the decomposedImages array
    */
    async handleSave(footId, imageObj, imageIndex) {

        console.log(imageObj.imageName);
        await axios.post(`${config.dev_server}/upload/save`, { foot: footId, toe: imageObj.selectedToeId, imageName: imageObj.imageName, fungalCoverage: imageObj.fungalCoverage })
            .then(() => {
                console.log("saved");
                this.setImageSavedToTrue(imageIndex);

                var tempSelectedToes = this.state.alreadySelectedToes;//this is so that only one image of a toe can be uploaded at a time
                tempSelectedToes[imageObj.selectedToeId] = true;
                this.setState({ alreadySelectedToes: tempSelectedToes });
            })
            .catch((error) => console.log(error));
    }

    printFootSelection_mobile() {
        var leftFootImage = GetFootSymbolByActive(LEFT_FOOT_ID, this.state.selectedFoot);
        var rightFootImage = GetFootSymbolByActive(RIGHT_FOOT_ID, this.state.selectedFoot);
        var defaultFootButtonClass = "foot-button";
        var activeFootButtonClass = defaultFootButtonClass + " active-toe-button";
        return (
            <div className="feet-buttons">
                <button onClick={this.setFoot.bind(this, LEFT_FOOT_ID)}
                    className={(this.state.selectedFootId === LEFT_FOOT_ID ? activeFootButtonClass : defaultFootButtonClass)}>
                    <img src={leftFootImage} className="footlogMobile" alt="left foot logo" />
                </button>

                <button onClick={this.setFoot.bind(this, RIGHT_FOOT_ID)}
                    className={(this.state.selectedFootId === RIGHT_FOOT_ID ? activeFootButtonClass : defaultFootButtonClass)}>
                    <img src={rightFootImage} className="footlogMobile" alt="right food logo" />
                </button>

            </div>
        )
    }

    printFootSelection_desktop() {
        var defaultFootButtonClass = "graph-foot-button";
        var activeFootButtonClass = defaultFootButtonClass + " active-toe-button";
        return (
            <div className="graph-feet-buttons">
                <button onClick={this.setFoot.bind(this, LEFT_FOOT_ID)}
                    className={(this.state.selectedFootId === LEFT_FOOT_ID ? activeFootButtonClass : defaultFootButtonClass)}>
                    <img src={leftFootLogo} className="footlogo" alt="left foot logo" />
                </button>

                <button onClick={this.setFoot.bind(this, RIGHT_FOOT_ID)}
                    className={(this.state.selectedFootId === RIGHT_FOOT_ID ? activeFootButtonClass : defaultFootButtonClass)}>
                    <img src={rightFootLogo} className="footlogo" alt="right food logo" />
                </button>
            </div>
        )
    }

    printDecomposedImage_desktop(imageObj, index) {
        return (
            <div key={imageObj.imageName} className="decomposeImageCol" style={{ border: `5px solid rgb(${imageObj.color})` }}>
                <div className="decomposeImage_div">
                    <img className="decomposeImage" src={imageObj.url} alt="nail"></img>
                </div>
                <Row noGutters={true} className="saveDiscardRow">
                    {
                        imageObj.saved === true
                            ?
                            <h6>Saved</h6>
                            :
                            imageObj.keepClicked === true
                                ?
                                this.state.calculatingFungalCoverage
                                    ?
                                    "Please wait while we calculate your fungal coverage..."
                                    :
                                    this.printDecompose_toeSelection(imageObj, index)
                                :
                                <Row>
                                    <span className="keepDiscardSpan">
                                        <Button id="discardBtn" onClick={() => this.decomposedImagesRemove(index)}>Discard</Button>
                                        <Button id="keepBtn" onClick={() => this.setImage_KeepClicked_ToTrue(index)}>Keep</Button>
                                    </span>
                                </Row>
                    }
                </Row>

            </div>
        )

    }

    printDecompose_toeSelection(imageObj, decomposeImageIndex) {
        var saveBtnClassName = (isMobile) ? "saveBtn_mobile" : "saveBtn";
        var toeButtons = (isMobile) ? "toeButtons_mobile" : "toeButtons_desktop";
        return (
            <div style={{ display: "inline" }}>
                <div>
                    <h6 className="select_the_toe_TEXT">Select The Toe:</h6>
                </div>
                <div className={toeButtons}>
                    {
                        this.printToeButtons(decomposeImageIndex)
                    }
                </div>
                <div>
                    <Button className={saveBtnClassName}
                        onClick={
                            this.handleSave.bind(this, this.state.selectedFootId, imageObj, decomposeImageIndex)
                        }
                    >Save</Button>
                </div>
            </div>
        );
    }



    print_keep_discard_mobile(index) {
        return (
            <div className="decompose_keepDiscard_mobile">
                <Button className="discardBtn_mobile" onClick={() => this.setImage_KeepClicked_ToTrue(index)}>Keep</Button>
                <Button className="keepBtn_mobile" onClick={() => this.decomposedImagesRemove(index)}>Discard</Button>
            </div>
        );
    }
    printDecomposedImage_mobile(imageObj, index) {

        return (
            <div key={index} className="decomposedRow_mobile" style={{ border: `2px solid rgb(${imageObj.color})` }}>
                <div className="decomposed_Img_Div_mobile">
                    <img src={imageObj.url} className="decomposeImage_mobile" alt={imageObj.imageName}></img>
                </div>

                {
                    imageObj.saved
                        ?
                        <div>
                            <div className="savedText_div">
                                <h6 className="savedText">Saved</h6>
                            </div>
                        </div>
                        :
                        imageObj.keepClicked
                            ?
                            this.state.calculatingFungalCoverage
                                ?
                                "Please wait while we calculate your fungal coverage..."
                                :
                                this.printDecompose_toeSelection(imageObj, index)
                            :
                            this.print_keep_discard_mobile(index)
                }

            </div>
        )

    }

    /* 
        rotates the image on canvas 90 degrees
        param left: boolean, if true rotates the image 90deg to the left, otherwise rotates 90deg right
    */
    rotateImage(left) {
        var angle = (left) ? +90 : -90;

        var canvas = this.uploadedImgRef.current;
        var ctx = canvas.getContext("2d");

        //rotate the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width / 2, canvas.height / 2);//translate to center
        ctx.rotate((Math.PI / 180) * angle); //need to convert from degrees into radian
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        //draw the image
        this.drawImageOnCanvas_fromImgObj(this.state.files[0].imageObject, false);

    }

    /*
        Prints the upload image page.
    */
    render() {
        var error;
        var buttonClassName = "btn-primary";
        if (isMobile) buttonClassName += " upload-image-button_mobile"; else buttonClassName += " upload-image-button";
        var uploadProgress = this.state.uploadProgress === 0 ? "" : this.state.uploadProgress;
        var imageClassName = (isMobile) ? "uploadedImg-mobile" : "uploadedImg-desktop";

        if (this.isParamNotSet()) //Either foot or toe isn't selected
        {
            buttonClassName += " greyed-button" //Highlight button grey so user doesn't think to click it yet

            if (this.state.showChooseFootAndToeError) //Only needed if button still isn't clicked
                error = "Which foot and toe are you uploading an image for?"
        }
        else if (this.state.invalidFileTypeError)
            error = "Invalid file type. Please upload an IMAGE file."


        /* for testing purposes
        // to see how the decomposed images look like without sending any picture to the server
        if (this.state.decomposedImages.length === 0) {
            this.setState({
                decomposedImages: [
                    {name: "1.PNG", url:galleryIcon, color: [255,0,0], cords: [20,30], keepClicked: false, saved: false},
                    {name: "2.PNG", url:rotateLeft_icon, color: [255,255,0], cords: [40,10], keepClicked: false, saved: false},
                    {name: "2.PNG", url:rotateLeft_icon, color: [255,255,0], cords: [40,10], keepClicked: false, saved: false},
                    {name: "2.PNG", url:rotateLeft_icon, color: [255,255,0], cords: [40,10], keepClicked: false, saved: false},
                    {name: "2.PNG", url:rotateLeft_icon, color: [255,255,0], cords: [40,10], keepClicked: false, saved: false}
                ]
            })
        }*/

        return (
            <Container>
                <h3 className="diagnosis-question">Which foot is the image for?</h3>

                { (isMobile) ? this.printFootSelection_mobile() : this.printFootSelection_desktop()}

                <br></br>
                <br></br>

                {/* Buttons to filter toes 
                <h3 className="diagnosis-question">Which toe is the image for?</h3>*/}

                {/*<ToeButtons setToe={this.setToe.bind(this)}></ToeButtons>*/}

                {/* Upload Section */}
                {
                    this.state.showUploadButton
                        ?
                        (isMobile) ? this.printUploadButton_mobile(buttonClassName) : this.printUploadButton_desktop(buttonClassName)
                        :
                        this.state.cameraOpen ? <div> <Camera overLayImage={GetUnshadedFootSymbolImage(this.state.selectedFootId, true)} onCaptured={(blob) => this.ImageUploadConfirmation(blob, "default.jpg", true)} />  </div> : ""
                }


                {/* Error Message or Upload Progress */}
                <Row className="centred-text-with-margin-above">
                    <h5>{uploadProgress}</h5>
                    <h5>{error}</h5>
                </Row>

                {/* List of Uploaded Images*/}
                <Row>
                    {this.state.files.map((source, index) => (
                        <Col key={`col-${index}`}>
                            {/* Image */}
                            <div className="image_div">
                                {/* Had to change the <img> to <canvas> because if the user rotates the image, the .toBlob on canvas gives us the image at the rotated degree */}
                                {/*<img ref={this.uploadedImgRef} key={index} src={source.url} className={imageClassName} alt="file" />*/}
                                <canvas ref={this.uploadedImgRef} key={index} className={imageClassName}></canvas>
                            </div>
                            {this.state.showUplodConfirmation && // only show the image rotation when the user is confirming the image
                                <div className="rotateImg_div">
                                    <img className="roateLeft_icon" src={rotateRight_icon} alt="Rotate left" onClick={() => this.rotateImage(true)}></img>
                                    <img className="roateRight_icon" src={rotateLeft_icon} alt="Rotate right" onClick={() => this.rotateImage(false)}></img>
                                </div>
                            }

                            {/* Image status */}
                            <Row>
                                <Col>
                                    <div id="uploadStatusText">{source.text}</div>
                                    {/*
                                    <Button id="diagnoseBtn" onClick={this.handleDiagnose.bind(this, index)}
                                        disabled={!source.valid}>
                                        Diagnose
                                    </Button>
                                    */}
                                    {this.state.showUplodConfirmation
                                        ?
                                        <div>
                                            <Button className="upload_looksGood_btn" onClick={() => {
                                                //updating the files with the new rotated image before upload
                                                var tempFile = this.state.files[0];
                                                this.uploadedImgRef.current.toBlob((blob) => {
                                                    tempFile.imageObject = blob;
                                                    this.setState({ files: [tempFile] },
                                                        this.handleUpload)
                                                });


                                            }
                                            }>
                                                Looks Good <span role="img" aria-label="happy emoji">😀</span>
                                            </Button>
                                            <Button className="upload_GoBack_btn" onClick={() => this.handleGoBack_discardUpload()}>
                                                Go back <span role="img" aria-label="sad emoji">☹️</span>
                                            </Button>
                                        </div>
                                        :
                                        ""
                                    }

                                </Col>
                            </Row>


                            {/* Results of Diagnosis */}
                            <Row>
                                <Col>
                                    {this.state.diagnosis.length > index && (
                                        <div className="card w-50 diagnosis-results-container" >
                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    Results
                                                </h5>
                                                <p className="card-text">
                                                    {
                                                        this.state.diagnosis[
                                                            this.state.diagnosis.findIndex(
                                                                ({ image }) => image === index)
                                                        ].text
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Col>
                    ))}
                </Row>
                {/* decomposed images */}
                <div className="decomposeImageRow">
                    {
                        (isMobile)
                            ?
                            this.state.decomposedImages.map(
                                //({ imageName, url, color, keepClicked, saved, selectedToeId }, index) => this.printDecomposedImage_mobile(imageName, url, color, keepClicked, saved,index)
                                (imageObj, index) => this.printDecomposedImage_mobile(imageObj, index)
                            )
                            :
                            this.state.decomposedImages.map(
                                //({ imageName, url, color, keepClicked, saved, selectedToeId }, index) => this.printDecomposedImage_desktop(imageName, url, color, keepClicked, saved, index)
                                (imageObj, index) => this.printDecomposedImage_desktop(imageObj, index)
                            )
                    }


                </div>

                <Row>
                    {
                        this.state.decomposedImages.length > 0
                            ?
                            <h5 className="returnToDashBoard_text">Return to <a href="/user">Dashboard</a></h5>
                            :
                            ""
                    }
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(Upload);
