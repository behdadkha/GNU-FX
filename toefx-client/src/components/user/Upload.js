/*
    Class for uploading images and diagnosing them after upload.
*/

import React, { Component } from "react";
import { Button, Container, Col, Row } from "react-bootstrap";
import { isMobile } from "react-device-detect";
import { connect } from "react-redux";
import axios from "axios";

import { config } from "../../config";

import "../../componentsStyle/Upload.css"
import "../../componentsStyle/Upload-Mobile.css"
import { GetFootSymbolByActive, GetUnshadedFootSymbolImage, getImage,
         TOE_COUNT, LEFT_FOOT_ID, RIGHT_FOOT_ID } from "../../Utils";

import leftFootLogo from '../../icons/leftfootlogo.png';
import rightFootLogo from '../../icons/rightfootlogo.png';
import cameraIcon from '../../icons/cameraIcon.png';
import galleryIcon from '../../icons/galleryIcon.png';
import rotateRight_icon from '../../icons/rotateRight_icon.png';
import rotateLeft_icon from '../../icons/rotateLeft_icon.png';

import Camera from './Camera.js';

//File types allowed for an image upload
const gPossibleFileTypes = ["image/x-png", "image/png", "image/bmp", "image/jpeg"];


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
            showUploadConfirmation: false, // if true shows two button for either accepting the image for upload or discarding it 
        };

        this.uploadedImgRef = React.createRef(); //Reference to the uploaded image, used for rotating the image
        this.validateImage = this.validateImage.bind(this); //Save for later use
    }

    /*
        Logs the user out if they're not logged in.
        Otherwise, helps with the back button functionality.
    */
    componentDidMount() {
        if (!this.props.auth.isAuth) { //Logged in
            window.location.href = "/Login";
            return;
        }
    
        window.onpopstate = this.onBackButtonEvent.bind(this);
        
        //Making sure the unsaved images get deleted when leaving the page
        window.addEventListener('beforeunload', (() => this.removeUnsavedImages(this.state.decomposedImages)), false);
    }

    /*
        Removes the unsaved image deletion event listener when the user leaves the page.
    */
    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.removeUnsavedImages, false);
    }

    /*
        Handles when the back button is pressed.
        param e: Back button event.
    */
    onBackButtonEvent(e) {
        e.preventDefault();
        window.location.reload(); //Reload the page to potentially remove the nav bar (if the new page doesn't have it)
    }

    /*
        Deletes any unsaved decomposed images from the database when the user leaves the page.
        param decomposedImages: this.state.decomposedImages, array of json, format [{name: "", url: "", keepClicked: false, saved: false}]
    */
    async removeUnsavedImages(decomposedImages) {
        //NOTE: this.state.decomposedImages can't be used, it needs to be passed in as an argument
        let imagesToDelete = [];

        for (let i = 0; i < decomposedImages.length; i++) {
            if (decomposedImages[i].saved === false) { //User did not save the image
                let imageName = decomposedImages[i].imageName;
                imagesToDelete.push(imageName); //Set it for deletion to free up space in the database
            }
        }

        //Request to delete the images
        if (imagesToDelete.length > 0) {
            await axios.delete(`${config.dev_server}/upload/deleteImage?images=${imagesToDelete}`)
                .then(() => {
                    console.log("All unsaved images have been removed.");
                })
                .catch((error) => console.log(`An error occurred deleting unsaved images: ${error}`));
        }
    }

    /*
        Updates the properties of the images in memory depending on the result of the image validation.
        param res: The result of the image validation.
    */
    processImageValidationResult(res) {
        if (res.data === undefined)
            return;

        var valid, text;
        var currentImageIndex = this.state.files.length - 1;
        var tempFiles = this.state.files; //A copy so setState can be used later
        var response = res.data;
        response = response.trim();
        valid = response === "toe";

        if (valid)
            text = "Upload success!"
        else
            text = "Please upload an image of a toe."

        //Save new validation
        tempFiles[currentImageIndex].valid = valid;
        tempFiles[currentImageIndex].text = text;
        this.setState({files: tempFiles});
    }

    /*
        Prints an error to the console if an error occurred during image validation.
        param error: The error to print.
    */
    printFileValidationErrorToConsole(error) {
        console.log(`Error validating file: ${error}`);
    }

    /*
        Checks if the image is a valid image of a toe.
        param file: The file to check.
    */
    validateImage(file) {
        this.setState({tempfileName: file}); //Used later if the user decides to run a diagnosis

        axios.get(`${config.dev_server}/imagevalidation/loggedin`)
            .then(res => this.processImageValidationResult(res))
            .catch((error) => this.printFileValidationErrorToConsole(error));
    }

    /*
        Sorts the decomposed images based on the cordinates (from left to right) taken from the original image.
    */
    orderDecomposedImagesLeftToRight() {
        let temp = this.state.decomposedImages;

        if (temp.length > 1) { //At least two images, otherwise no point in sorting
            temp.sort((a, b) => a.cord[0] - b.cord[0])
            this.setState({decomposedImages: temp})
        }
    }

    /*
        Initiates nail decomposition (extracts nails from the uploaded foot image).
        Fills the decomposedImages state variable with the recieved data from the server.
    */
    async decomposeImage() {
        //1. request the backend to decompose the image
        //2. change the upload msg text

        await axios.get(`${config.dev_server}/upload/decompose`)
            .then(async res => {
                //Res has data: {imagesInfo: [{name: "", cord: [x,y], color: [r,g,b]}], CLRImage: "name_CLR.png", fungalCoverage: "0%"}
                if (res.data.imagesInfo.length === 0) {
                    var tempFile = this.state.files[0];
                    tempFile.text = "No nails were found in the image. Click on either toe to restart."
                    this.setState({files: [tempFile]})
                    return;
                }

                //Format: res.data.imagesInfo[{name: "", cord: [x,y], color: [r,g,b]}]
                var images = [];
                var promises = res.data.imagesInfo.map(async ({ name, cord, color, fungalCoverage }) => {
                    var imageObj = await getImage(name);

                    //Add the additional info to the imageobj
                    imageObj["cord"] = cord;
                    imageObj["color"] = color;
                    imageObj["keepClicked"] = false;
                    imageObj["saved"] = false;
                    imageObj["selectedToeId"] = -1; //By default not selected
                    imageObj["fungalCoverage"] = fungalCoverage;
                    images.push(imageObj);
                });

                //Wait for the map to finish and then save the images to the state
                Promise.all(promises).then(() => {
                    //console.log(images);

                    //Set the state and order the images
                    this.setState({
                        decomposedImages: images
                    }, () => {
                            //Call the order function right after the state is set to order the images
                            this.orderDecomposedImagesLeftToRight();
                        }
                    )
                });

                //Get the new original with the nails outlines in different colours
                let originalImageWithNailOutlines = "";
                await axios.get(`${config.dev_server}/getImage?imageName=${res.data.CLRImage}`, {responseType: "blob"})
                    .then((image) => {
                        originalImageWithNailOutlines = image.data;
                    });

                let tempFiles = this.state.files;
                tempFiles[0].text = "Choose the nails you would like to save.";
                tempFiles[0].imageObject = originalImageWithNailOutlines;
                tempFiles[0].url = URL.createObjectURL(originalImageWithNailOutlines);

                this.setState({
                    files: tempFiles
                }, () => {
                    var canvas = this.uploadedImgRef.current;
                    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height); //Clear the canvas
                    this.drawImageOnCanvasFromImgObj(originalImageWithNailOutlines, true)  //Draw the image, after the file's variable is saved
                });
            })
            .catch((error) => this.printFileValidationErrorToConsole(error));
    }

    /*
        Updates the upload status during a file upload.
        param progressEvent: An object containing the current state of the upload.
    */
    updateUploadProgress(progressEvent) {
        if (progressEvent.loaded <= 0 || progressEvent.total <= 0) //Faulty numbers
            return;

        let progress = Math.round((progressEvent.loaded / progressEvent.total) * 100) + "%";
        this.setState({uploadProgress: progress});
    }

    /*
        Processes the requested upload of an image by the user.
        param e: The upload event.
    */
    async handleUpload() {
        var file = this.state.files[0];
        file.text = "Processing your image, this may take a minute..."
        this.setState({
            showUploadConfirmation: false,
            files: [file]
        });

        file = file.imageObject;

        const formData = new FormData(); //formData contains the image to be uploaded
        formData.append("file", file);
        formData.append("foot", this.state.selectedFootId);
        formData.append("toe", this.state.selectedToeId);

        axios.post(`${config.dev_server}/upload/loggedin`, formData, {
            onUploadProgress: (ProgressEvent) => this.updateUploadProgress(ProgressEvent)
        }).then(() => {
            console.log("Done. Now validating the image...")
            this.decomposeImage(); //Break the uploaded image down into smaller nails
        });
    }

    /*
        Handles when the open camera button is pressed on mobile devices.
    */
    handleOpenCameraMobile() {
        //Hide the upload button and open camera
        this.setState({
            showUploadButton: false,
            cameraOpen: true
        });
    }

    /*
        Handles when the "go back" button is clicked to discard an image uploaded.
    */
    handleDiscardUpload() {
        //Remove the image and go back to show both options(gallery and camera)
        this.setState({
            showUploadButton: true,
            files: []
        });
    }

    /*
        Checks if the user choose a foot for their uploaded image.
        returns: True if the user chose a foot, false otherwise.
    */
    isFootNotChosen() {
        return this.state.selectedFootId === -1; //|| this.state.selectedToeId === -1;
    }

    /*
        Performs bounds checking on the decomposedImages array.
        param index: The index to check is within the array bounds.
        returns: True if the index is within the array bounds, falas otherwise.
    */
    isValidDecomposedImageIndex(index) {
        return index >= 0 && index < this.state.decomposedImages.length;
    }

    /*
        Checks if a toe has been chosen for a decomposed image, in order to highlight it as active.
        returns: true if the decomposedImage[decomposeImageIndex].selectedToeId == toeid
    */
    isToeIdSelectedForNailImage(toeId, decomposeImageIndex) {
        return toeId === this.state.decomposedImages[decomposeImageIndex].selectedToeId;
    }

    /*
        Sets the chosen foot in the system to the user's chosen foot and resets the page.
    */
    setFoot(footId) {
        if (footId === LEFT_FOOT_ID || footId === RIGHT_FOOT_ID) {
            var tempDecomposedImages = this.state.decomposedImages;

            //This can't be done with a helper function along with the constructor, as the constructor must set the state directly.
            this.setState({
                selectedFootId: footId, //Selected  ---> the rest is for reseting the page
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
                showUploadConfirmation: false,
            });

            //Remove the unsaved images from the server
            this.removeUnsavedImages(tempDecomposedImages);
        }
    }

    /*
        Sets the chosen toe in the system to the user's chosen toe.
    */
    setToe(toeId) {
        if (toeId >= 0 && toeId < TOE_COUNT)
            this.setState({selectedToeId: toeId});
    }

    /*
        Deletes one of the decomposed images that the user chose not to save.
        param index: Array index to be removed.
    */
    async removeNailImage(index) {
        let tempImages = this.state.decomposedImages;
        let imageName = tempImages[index].imageName;

        if (this.isValidDecomposedImageIndex(index)) { //Bounds checking
            tempImages.splice(index, 1);

            //console.log(imageName)
            await axios.delete(`${config.dev_server}/upload/deleteImage?images=${imageName}`)
                .then(res => {
                    //console.log("removed");
                    this.setState({
                        decomposedImages: tempImages
                    });

                    //Refresh the page if the user discarded all of the images
                    if (tempImages.length === 0)
                        window.location.reload();
                })
                .catch((error) => console.log(`An error occurred removing an image: ${error}`));
        }
    }

    /*
        Sets the saved value of an specific image inside the decomposedImages state variable to true.
        This allows it to be saved to the user's account.
        param index: Decomposed image index.
    */
    setImageSavedToTrue(index) {
        let tempImages = this.state.decomposedImages;

        if (this.isValidDecomposedImageIndex(index))
            tempImages[index].saved = true;

        this.setState({
            decomposedImages: tempImages,
            calculatingFungalCoverage: false,
        });
    }

    /*
        Sets the keepClicked value of an specific image inside the decomposedImages state variable to true.
        param index: Decomposed image index.
    */
    setImageKeepClickedToTrue(index) {
        let tempImages = this.state.decomposedImages;

        if (this.isValidDecomposedImageIndex(index))
            tempImages[index].keepClicked = true;

        this.setState({
            decomposedImages: tempImages
        });
    }

    /*
        Sets the selectedToeId of a decomposedImage.
        param toeId: The value to set the selectedToeId to
        param decomposeImageIndex: The index of the decomposed images;
    */
    setDecomposeImage_toeId(toeId, decomposeImageIndex) {
        var temp = this.state.decomposedImages;
        temp[decomposeImageIndex].selectedToeId = toeId;
        this.setState({decomposedImages: temp})
    }
    
    /*
        Prints one of the buttons the user can press to select a toe.
        param toeId: The toe the button is for.
        param active: Make the button darker if active is true
        param decomposeImageIndex: the button are getting printed for this image, need this to set the selectedToeId
    */
    printToeButton(toeId, active, decomposeImageIndex) {
        var defaultToeButtonClass = "uploadToes" + toeId;
        var activeToeButtonClass = defaultToeButtonClass + " active-toe-button"; //When the toe is selected
        var isDisabled = this.state.alreadySelectedToes[toeId]; //Can't select a toe chosen for another nail already
        var buttonClassName = active ? activeToeButtonClass : defaultToeButtonClass;

        return (
            <div key={toeId} style={{display: "inline"}} className={`divToe${toeId}`}>
                <button onClick={() => {
                        this.setToe(toeId)
                        this.setDecomposeImage_toeId(toeId, decomposeImageIndex)
                    }}
                    className={buttonClassName}
                    disabled={isDisabled}
                />
                {/*</button>*/}
            </div>
        );
    }

    /*
        Adds buttons to a nail image where user can select which toe it's for.
    */
    printToeButtons(decomposedImageIndex) {
        var toeOrder = [];
        for (let i = 0; i < TOE_COUNT; ++i)
            toeOrder.push(i); //Initial view in order of ids (based on right foot)

        if (this.state.selectedFootId === LEFT_FOOT_ID)
            toeOrder.reverse(); //Toes go in opposite order on left foot

        return (
            <span className="toolbar">
                {
                    toeOrder.map((toeId) =>
                        this.printToeButton(toeId,
                                            this.isToeIdSelectedForNailImage(toeId, decomposedImageIndex),
                                            decomposedImageIndex))
                }
            </span>
        );
    }

    /*
        Draws the image on canvas
        converts the imageobject to image and draws it on the canvas
        param imageObject: blob, recieved from the input field, e.target.files[0]
        param set_width_height: if true, set the canvas width and height
    */
    drawImageOnCanvasFromImgObj(imageObject, set_width_height) {
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
        this.drawImageOnCanvasFromImgObj(imageObject, true);

        var newStateItems =
        {
            files: [
                ...this.state.files, //Append new image onto end of old file list
                { imageObject: imageObject, url: URL.createObjectURL(file), name: imageName, valid: false, text: '' },
            ],
            uploaded: true,
            input: imageName,

            showUploadButton: false, //hide the upload related buttons and show confirmation buttons
            showUploadConfirmation: true
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
                                htmlFor={!this.isFootNotChosen() ? "inputGroupFile01" : ''}
                                onClick={this.isFootNotChosen() ? () =>
                                    this.setState({ showChooseFootAndToeError: true })
                                    : () => {
                                        this.handleOpenCameraMobile();
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
                            htmlFor={!this.isFootNotChosen() ? "inputGroupFile01" : ''}
                            onClick={this.isFootNotChosen() ? () =>
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
                                htmlFor={!this.isFootNotChosen() ? "inputGroupFile01" : ''}
                                onClick={this.isFootNotChosen() ? () =>
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
                                        <Button id="discardBtn" onClick={() => this.removeNailImage(index)}>Discard</Button>
                                        <Button id="keepBtn" onClick={() => this.setImageKeepClickedToTrue(index)}>Keep</Button>
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
                <Button className="discardBtn_mobile" onClick={() => this.setImageKeepClickedToTrue(index)}>Keep</Button>
                <Button className="keepBtn_mobile" onClick={() => this.removeNailImage(index)}>Discard</Button>
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
        this.drawImageOnCanvasFromImgObj(this.state.files[0].imageObject, false);

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

        if (this.isFootNotChosen()) { //Either foot or toe isn't selected
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
                            {this.state.showUploadConfirmation && // only show the image rotation when the user is confirming the image
                                <div className="rotateImg_div">
                                    <img className="roateLeft_icon" src={rotateRight_icon} alt="Rotate left" onClick={() => this.rotateImage(true)}></img>
                                    <img className="roateRight_icon" src={rotateLeft_icon} alt="Rotate right" onClick={() => this.rotateImage(false)}></img>
                                </div>
                            }

                            {/* Image status */}
                            <Row>
                                <Col>
                                    <div id="uploadStatusText">{source.text}</div>
                                    {this.state.showUploadConfirmation
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
                                            <Button className="upload_GoBack_btn" onClick={() => this.handleDiscardUpload()}>
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
