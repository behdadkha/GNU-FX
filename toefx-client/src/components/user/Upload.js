/*
    Class for uploading images and diagnosing them after upload.
*/

import React, { Component } from "react";
import { Button, Container, Col, Row } from "react-bootstrap";
import { connect } from "react-redux";
import axios from "axios";
import { config } from "../../config";

import "../../componentsStyle/Upload.css";
import { GetToeName, TOE_COUNT, LEFT_FOOT_ID, RIGHT_FOOT_ID } from "../../Utils";
import leftFootLogo from '../../icons/leftfootlogo.png';
import rightFootLogo from '../../icons/rightfootlogo.png';

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
            files: [], //Currently uploaded files
            diagnosis: [], //List of {image: 0, text:""}
            decomposedImages: [], //the decomposed images from the uploaded foot image {name: imageName, url:"blob", keepClicked: false, saved: false}
            uploadProgress: 0, //Percentage of upload of image completed
            tempfileName: "", //Helper with processing image
            foot: "", //The foot name the image is for. Sent to /uploadimage endpoint
            toe: "", //The toe name the image is for
            selectedFootId: -1, //The index of the foot the user selected
            selectedToeId: -1, //The index of the toe the user selected
            showChooseFootAndToeError: false, //Helps display and error if either a foot or toe is not chosen
            invalidFileTypeError: false, //Helps display an error if the user tried uploading a non-image file
        };

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
    async onLeave(decomposedImages) {

        let imagesToDelete = [];
        for (let i = 0; i < decomposedImages.length; i++) {

            //user did not save the image
            if (decomposedImages[i].saved === false) {
                let imageName = decomposedImages[i].name;
                imagesToDelete.push(imageName);
            }
        }
        //requesting to delete the images
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
        window.onpopstate = this.onBackButtonEvent.bind(this);
        window.addEventListener('beforeunload', (() => this.onLeave(this.state.decomposedImages)), false);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.onLeave, false)
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

    */
    async getImage(imageName) {
        await axios.get(`${config.dev_server}/getImage?imageName=${imageName}`, { responseType: "blob" })
            .then((image) => {
                this.setState({ decomposedImages: [...this.state.decomposedImages, { name: imageName, url: URL.createObjectURL(image.data), keepClicked: false, saved: false }] });
            });
    }
    /*
        initiates nail decompose(extracts nails from the uploaded foot image)
        fills the decomposedImages state variable with the recieved data from the server
    */
    async decomposeImage() {
        await axios.get(`${config.dev_server}/upload/decompose`)
            .then(res => res.data.imageNames.map(imageName => this.getImage(imageName)))
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
    async handleUpload(e) {
        let file = e.target.files[0];

        if (gPossibleFileTypes.findIndex(item => item === file.type) === -1) {
            //Invalid file type
            this.setState({ invalidFileTypeError: true });
            return;
        }
        else {
            //Remove the error in case it was there before
            this.setState({ invalidFileTypeError: false });
        }

        this.setState({
            files: [
                ...this.state.files, //Append new image onto end of old file list
                { url: URL.createObjectURL(file), name: file.name, valid: false, text: 'Processing your image...' },
            ],
            uploaded: true,
            input: file.name,
        });
        //Now that the file has been confirmed, upload it to the database -- THIS SHOULD COME AFTER VALIDATION!!!
        const formData = new FormData(); //formData contains the image to be uploaded
        formData.append("file", e.target.files[0]);
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
        else { //User isn't logged in

            //It sends the temporary image name (time in ms) to validateImage
            await axios.post(`${config.dev_server}/upload/notloggedin`, formData, {
                onUploadProgress: (ProgressEvent) => this.updateUploadProgress(ProgressEvent)
            }).then((res) => {
                console.log("Done, now validating the image")
                this.validateImage(res.data.img);
            });

        }

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
        Sets the chosen foot in the system to the user's chosen foot.
    */
    setFoot(footId) {
        if (footId === 0 || footId === 1)
            this.setState({ selectedFootId: footId });
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
        let imageName = tempImages[index].name;

        if (index > -1) {
            tempImages.splice(index, 1);
        }

        await axios.delete(`${config.dev_server}/upload/deleteImage?images=${imageName}`)
            .then(res => {
                console.log("removed");
                this.setState({
                    decomposedImages: tempImages
                });
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
            decomposedImages: tempImages
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
    */
    printToeButton(toeId) {
        var defaultToeButtonClass = "uploadToes" + toeId;
        var activeToeButtonClass = defaultToeButtonClass + " active-toe-button"; //When the toe's data is being shown on the chart
        let names = ["Big", "Index", "Middle", "4th", "Little"]

        /*return (
            <button key={toeId} onClick={this.setToe.bind(this, toeId)}
                    className={(this.state.selectedToeId === toeId ? activeToeButtonClass : defaultToeButtonClass)}>
                {GetToeName(toeId)}
            </button><h6>{names[toeId]}</h6>
        );*/
        return (
            <div style={{ display: "inline" }} className={`divToe${toeId}`}>
                <button key={toeId} onClick={this.setToe.bind(this, toeId)}
                    className={(this.state.selectedToeId === toeId ? activeToeButtonClass : defaultToeButtonClass)}>

                </button>
            </div>
        );
    }

    /*
        Adds buttons to the page where user can select toes.
    */
    printToeButtons() {
        var toeOrder = [];
        for (let i = 0; i < TOE_COUNT; ++i)
            toeOrder.push(i); //Initial view in order of ids (based on right foot)

        if (this.state.selectedFootId === LEFT_FOOT_ID)
            toeOrder.reverse(); //Toes go in opposite order on left foot

        return (
            <span className="toolbar">
                {
                    toeOrder.map((toeId) => this.printToeButton(toeId))
                }
            </span>
        );
    }

    /*
        sends a request to the backend to save the image

        param imageIndex: images's index in the decomposedImages array
    */
    async handleSave(footId, toeId, imageName, imageIndex) {
        await axios.post(`${config.dev_server}/upload/save`, { foot: footId, toe: toeId, imageName: imageName })
            .then(res => {
                console.log("saved");
                this.setToe(-1);
                this.setImageSavedToTrue(imageIndex);
            })
            .catch((error) => console.log(error));
    }

    /*
        Prints the upload image page.
    */
    render() {
        var error;
        var defaultFootButtonClass = "graph-foot-button";
        var activeFootButtonClass = defaultFootButtonClass + " active-toe-button";
        var buttonClassName = "btn-primary upload-image-button";
        var uploadProgress = this.state.uploadProgress === 0 ? "" : this.state.uploadProgress;

        if (this.isParamNotSet()) //Either foot or toe isn't selected
        {
            buttonClassName += " greyed-button" //Highlight button grey so user doesn't think to click it yet

            if (this.state.showChooseFootAndToeError) //Only needed if button still isn't clicked
                error = "Which foot and toe are you uploading an image for?"
        }
        else if (this.state.invalidFileTypeError)
            error = "Invalid file type. Please upload an IMAGE file."

        return (
            <Container>
                <h3 className="diagnosis-question">Which foot is the image for?</h3>

                {/* Buttons to change which foot is being viewed */}
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

                <br></br>
                <br></br>

                {/* Buttons to filter toes 
                <h3 className="diagnosis-question">Which toe is the image for?</h3>*/}

                {/*<ToeButtons setToe={this.setToe.bind(this)}></ToeButtons>*/}

                {/* Upload Button */}
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
                                    onChange={this.handleUpload.bind(this)}
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
                            <Row>
                                <Col>
                                    <img key={index} src={source.url} className="diagnosisImg" alt="uploaded" />
                                </Col>
                            </Row>

                            {/* Image Name & Diagnose Button */}
                            <Row>
                                <Col>
                                    <div id="uploadStatusText">{source.text}</div>
                                    <Button id="diagnoseBtn" onClick={this.handleDiagnose.bind(this, index)}
                                        disabled={!source.valid}> {/* Only can diagnose valid images of toes */}
                                        Diagnose
                                    </Button>
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
                <Row className="decomposeImageRow">
                    {
                        this.state.decomposedImages.map(({ name, url, keepClicked, saved }, index) =>
                            <Col key={name} className="decomposeImageCol">
                                <Row>
                                    <img className="decomposeImage" src={url}></img>
                                </Row>
                                <Row noGutters={true} className="saveDiscardRow">
                                    {
                                        saved === true
                                            ?
                                            <h6>saved</h6>
                                            :
                                            keepClicked === true
                                                ?
                                                <Row>
                                                    <h6>Select The Toe:</h6>
                                                    {
                                                        this.printToeButtons()
                                                    }
                                                    <Row>
                                                        <Button className="saveBtn"
                                                            onClick={this.handleSave.bind(this, this.state.selectedFootId, this.state.selectedToeId, name, index)}
                                                        >
                                                            Save
                                                        </Button>
                                                    </Row>
                                                </Row>
                                                :
                                                <Row>
                                                    <Col>
                                                        <Button id="discardBtn" onClick={this.decomposedImagesRemove.bind(this, index)}>Discard</Button>
                                                    </Col>
                                                    <Col>
                                                        <Button id="keepBtn" onClick={this.setImage_KeepClicked_ToTrue.bind(this, index)}>Keep</Button>
                                                    </Col>
                                                </Row>
                                    }
                                </Row>

                            </Col>
                        )
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
