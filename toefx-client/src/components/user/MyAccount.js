/*
    Class for displaying the user's account details and uploaded images.
*/

import React, { Component } from 'react';
import { Container, Button, Table, Modal } from 'react-bootstrap';
import { isMobile } from "react-device-detect";
import { connect } from "react-redux";
import TableScrollbar from 'react-table-scrollbar';
import Axios from 'axios';

import { config } from "../../config";
import store from '../../Redux/store';
import { getAndSaveImages, getAndSaveToeData } from '../../Redux/Actions/setFootAction';
import {
    GetToeSymbolImage, GetImageURLByName, RotateImage90Degrees,
    TOE_COUNT, LEFT_FOOT_ID, RIGHT_FOOT_ID
} from "../../Utils";
import Sidebar from "./Sidebar";

import '../../componentsStyle/MyAccount.css'
import FeetButtons from './FeetButtons';
import RotateRightIcon from '../../icons/rotateRight_icon.png';
import RotateLeftIcon from '../../icons/rotateLeft_icon.png';


class MyAccount extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            email: "", //The logged in user's email address
            imageUrls: [], //User's images
            toeData: { feet: [{}, {}] }, //Data for user's images {id, userID, feet: []}
            selectedFootIndex: LEFT_FOOT_ID, //Start by showing data for the left foot
            dataLoaded: false, //Used for showing the loading screen until all data are loaded
            showDeleteConfirmation: false,
            showRotateModal: false,
            toRotateInfo: {},
            toDeleteInfo: {}, //{imageName, imageIndex in toeData, toeIndex, selectedFootindex}
            rotationSaveStatus: "" // to show the saving... message after rotation
        };

        this.canvasRef = React.createRef(); //Used for rotating images
    }

    /*
        Logs the user out if they're not logged in.
        Otherwise loads the user's data from the server.
    */
    async componentDidMount() {
        //Redirect to login page if user not logged in
        if (!this.props.auth.isAuth) {
            window.location.href = "/login";
            return;
        }

        //Redux data gets erased after a refresh, so if the data is gone we need to get it again
        if (this.props.foot !== undefined && this.props.foot.images.length === 0) {
            await store.dispatch(getAndSaveImages()); //Load the user's images
            await store.dispatch(getAndSaveToeData()); //Load the user's toe data
        }

        //Get the user's info from the server
        let userInfo = (await Axios.get(`${config.dev_server}/user/getUserInfo`)).data;

        this.setState({
            email: userInfo.email,
            imageUrls: this.props.foot.images,
            toeData: this.props.foot.toeData,
            dataLoaded: true, //Used to indicate whether or not a notification should be displayed to upload images before starting
        });

        /*else {
            //Get the user's info from the server
            let userInfo = (await Axios.get(`${config.dev_server}/user/getUserInfo`)).data;
            this.setState({email: userInfo.email, dataLoaded: true})
        }*/
    }

    /*
        Redirects the user to a page where they can reset their password.
    */
    navigateToResetPasswordPage() {
        window.location.href = "/user/resetPassword";
    }

    /*
        Changes which foot's images the user is viewing.
        param footIndex: The foot to show images for.
    */
    viewFoot(footIndex) {
        this.setState({
            selectedFootIndex: footIndex,
        });
    }

    /*
        Prepares to show or hide the delete confirmation modal.
    */
    toggleDeleteConfirmation() {
        this.setState({
            showDeleteConfirmation: !this.state.showDeleteConfirmation
        });
    }

    /*  
        Prepares to show or hide the image rotation modal.
    */
    toggleShowRotateModal() {
        this.setState({
            showRotateModal: !this.state.showRotateModal
        });
    }

    /*
        The first step of rotating one of the user's uploaded images 90 degrees to the left.
        param imageName: The name of the image to rotate.
    */
    async prepareRotateImage(imageName) {
        let imageURL = await GetImageURLByName(this.state.imageUrls, imageName);

        this.setState({
            toRotateInfo: { imageName: imageName, imageURL: imageURL },
            showRotateModal: true
        });

        this.drawImageOnCanvasFromImgUrl(imageURL, true);
    }

    /*
        Draws the image to be rotated on a canvas.
        param imageURL: Blob, recieved from the input field, e.target.files[0]
        param setWidthHeight: If true, sets the canvas width and height using the image's width and and height.
    */
    drawImageOnCanvasFromImgUrl(imageURL, setWidthHeight) {
        var img = new Image();

        img.src = imageURL;
        img.onload = () => {
            var ctx = this.canvasRef.current.getContext("2d");

            //If it's the first time, we need to set the width hand height of canvas based on the image
            if (setWidthHeight) {
                this.canvasRef.current.width = img.width;
                this.canvasRef.current.height = img.height;
            }

            ctx.drawImage(img, 0, 0);
            ctx.save();
        }
    }

    /* 
        Rotates the image on canvas 90 degrees.
        param left: If true, rotates the image 90 degrees to the left, otherwise 90 degrees to the right.
    */
    rotateImage(left) {
        //Rotate the canvas
        RotateImage90Degrees(this.canvasRef.current, left);

        //Draw the new image
        this.drawImageOnCanvasFromImgUrl(this.state.toRotateInfo.imageURL, false);
    }

    /*
        Sends a request to the backend to save the image.
        param imageName: The image's file name.
    */
    handleSave(imageName) {
        this.setState({ rotationSaveStatus: "Saving..." })

        this.canvasRef.current.toBlob(async (blob) => {
            const formData = new FormData(); //FormData contains the image to be uploaded
            formData.append("file", blob);
            formData.append("imageName", imageName);

            await Axios.post(`${config.dev_server}/user/saveRotation`, formData)
                .then(async (msg) => {
                    if (msg.data.msg === "saved") { //The rotated image was successfully saved
                        await store.dispatch(getAndSaveImages()); //Reload the user's images
                        this.setState({
                            imageUrls: this.props.foot.images,
                            rotationSaveStatus: ""
                        });

                        this.toggleShowRotateModal();
                    }
                    else {
                        console.log("An error occurred while attempting to rotate the image.");
                    }
                }).catch((error) => console.log(`Error rotating image: ${error}`));
        });
    }

    /*
        Deletes one of the user's uploaded image.
        param imageName: The name of the image to delete. backend uses the imagename to delete the image from the user.images array
        param selectedFootIndex: The index of the selected foot to delete, 0 for left foot and 1 for right foot.
        param toeIndex: The index of the selected toe to delete, ranges from 0 to 4,
        param imageIndex: The index of the image to delete. need to know which image of the selected toe to delete. toe: {images [1.png, 2.png]} 
    */
    deleteImage() {
        //imageName, selectedFootIndex, toeIndex, imageIndex
        var toDeleteInfo = this.state.toDeleteInfo;
        var selectedFootIndex = toDeleteInfo.selectedFootIndex;
        var toeIndex = toDeleteInfo.toeIndex;
        var imageIndex = toDeleteInfo.imageIndex;
        var imageName = toDeleteInfo.imageName;

        try {
            if (selectedFootIndex === LEFT_FOOT_ID || selectedFootIndex === RIGHT_FOOT_ID) {
                if (toeIndex >= 0 && toeIndex < TOE_COUNT) {
                    Axios.get(`${config.dev_server}/deleteImage?footIndex=${selectedFootIndex}&toeIndex=${toeIndex}&imageIndex=${imageIndex}&imageName=${imageName}`)
                        .then(() => {
                            //Hide the delete confirmation modal - MUST BE FIRST!
                            this.toggleDeleteConfirmation();

                            //Remove the image just deleted from the state
                            var tempData = this.state.toeData;
                            tempData.feet[selectedFootIndex].toes[toeIndex].images.splice(imageIndex, 1);
                            this.setState({ toeData: tempData });
                        })
                }
            }
        }
        catch (error) {
            console.log(`Error deleting image: ${error}`);
        }
    }

    /*
        Prints one of the user's uploaded images in the image list.
        param toeIndex: The toe toeIndex to be printed.
        param toe: The toe the image is for.
        param includeEditButtons: Includes the rotate and delete button if true.
        param name: The name of the image for finding its URL.
        param date: The date the image was taken.
        param fungalCoverage: The fungal coverage percent of the image.
        param imageIndex: The index of the current toe's images for marking editing.
    */
    printUploadedImage(toeIndex, includeEditButtons = true, name, date, fungalCoverage, imageIndex) {
        //List is ordered by: Image, Toe Name, Fungal Coverage %, Upload Date
        var columnClass = (!isMobile) ? "uploaded-image-table-col" : "uploaded-image-table-col-mobile";
        var imageColumnClass = (!isMobile) ? "uploaded-image-table-toe-image-col" : "uploaded-image-table-toe-image-col-mobile";
        return (
            <tr key={date + ' ' + toeIndex}>
                {(!isMobile)
                ?
                    <td className={imageColumnClass}
                    style={{ backgroundImage: "url('" + GetImageURLByName(this.state.imageUrls, name) + "')" }}> {/*Fill the cell with the image*/}
                    </td>
                :
                    <td className={imageColumnClass}>
                        <img className="img_table" src={GetImageURLByName(this.state.imageUrls, name)} style={{ backgroundImage: "url('" +  + "')" }} alt="loading.." /> 
                    </td>
                }
                
                <td className={columnClass}>
                    {GetToeSymbolImage(this.state.selectedFootIndex, toeIndex)}
                </td>
                <td className={columnClass}>{fungalCoverage}</td>
                <td className={columnClass}>{date.split("T")[0]}</td>

                {
                    includeEditButtons
                        ?
                        <td className={columnClass}>
                            <Button className="delete-image-button" onClick={this.prepareRotateImage.bind(this, name)}>
                                Rotate
                            </Button>
                            <br />
                            <Button className="delete-image-button"
                                onClick={() => {
                                    this.setState({
                                        toDeleteInfo: {
                                            imageName: name,
                                            imageIndex: imageIndex,
                                            toeIndex: toeIndex,
                                            selectedFootIndex: this.state.selectedFootIndex
                                        },
                                        showDeleteConfirmation: true
                                    });
                                }}
                            >
                                Delete
                            </Button>
                        </td>
                        :
                        ""
                }
            </tr>
        );
    }

    /*
        Prints the image the user requested to delete in a pop up modal.
    */
    printUploadedImageToBeDeleted() {
        if (this.state.showDeleteConfirmation) { //So the page doesn't crash after deleting an image
            var toeIndex = this.state.toDeleteInfo.toeIndex;
            var toe = this.state.toeData.feet[this.state.toDeleteInfo.selectedFootIndex].toes[this.state.toDeleteInfo.toeIndex];
            var toeImageData = toe.images[this.state.toDeleteInfo.imageIndex];

            return (
                this.printUploadedImage(toeIndex, false, //No need to show the delete and rotate buttons in the modal
                    toeImageData.name, toeImageData.date, toeImageData.fungalCoverage, 0)
            );
        }

        return "";
    }

    /*
        Prints all of the user's uploaded images for one of their toes in the image list.
        param toeIndex: The toe toeIndex to be printed.
        param toe: The toe the images are for.
        param includeEditButtons: Includes the rotate and delete button if true.
    */
    printUploadedImagesForToe(toeIndex, toe, includeEditButtons = true) {
        return (
            toe.images.map(({ name, date, fungalCoverage }, imageIndex) =>
                this.printUploadedImage(toeIndex, includeEditButtons,
                    name, date, fungalCoverage, imageIndex)
            )
        )
    }

    /*
        checks if there are any images for the selected foot
        param footIndex: 0 => left foot, 1 => right foot
        returns true if there are any images for the selected foot in the database
     */
    existsAnyImages_for_selectedFoot(footIndex) {
        try {
            if (this.state.toeData.feet[footIndex].toes !== undefined) {
                for (let i = 0; i < 5; i++) {//5 toes
                    if (this.state.toeData.feet[footIndex].toes[i].images.length > 0)
                        return true;
                }
            }
        } catch {
            return false;
        }
        return false;
    }

    /*
        Displays the account page.
    */
    render() {
        //Bubble displaying user name, email, and option to reset password
        var accountDetailsBubble =
            <div className={"account-details" + (isMobile ? "-mobile" : "")}>
                <h3 className={"account-details-title" + (isMobile ? " account-details-title-mobile" : "")}>Account Details</h3>
                <h6 className={"account-details-name" + (isMobile ? " account-details-name-mobile" : "")}>
                    <label className="account-details-info-label">Name: </label>
                    {this.props.auth.user.name}
                </h6>
                <h6 className={"account-details-name" + (isMobile ? " account-details-name-mobile" : "")}>
                    <label className="account-details-info-label">Email: </label>
                    {this.state.email}
                </h6>

                <Button className="reset-password-button" onClick={this.navigateToResetPasswordPage.bind(this)}>Reset Password</Button>
            </div>;

        //Bubble for displaying the images the user uploaded previously (only on desktop)
        //Display "Loading..." text while images are being retreived from the server
        var imageTableBubble =
            <div className={(!isMobile) ? "uploaded-image-container" : ""}>
                {
                    /* Buttons for changing which foot to view */
                    //GetDesktopFeetButtons(this, selectedFootIndex)
                    <FeetButtons onFootSelect={(footId) => this.viewFoot(footId)} selectedFootIndex={this.state.selectedFootIndex} />
                }
                {
                    (!this.existsAnyImages_for_selectedFoot(this.state.selectedFootIndex))
                        ? //User never uploaded images before
                        <div className="uploaded-image-container">
                            {(!isMobile) ? <h4>Press "+ Upload Image" to get started.</h4> : <h4>Press "+ Upload Image" to get started.</h4>}
                        </div>
                        :// Actual Table 
                        <TableScrollbar height="80vh" className="table-scrollbar">
                            <Table striped bordered className="uploaded-image-table table-dark">
                                <thead>
                                    <tr>
                                        <th className="uploaded-image-table-image-header">Image</th>
                                        <th className="uploaded-image-table-toe-header">Toe</th>
                                        <th className="uploaded-image-table-coverage-header">Fungal Coverage (%)</th>
                                        <th className="uploaded-image-table-date-header">Upload Date</th>
                                        <th className="uploaded-image-table-delete-header">Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        //Print a list of images with data
                                        this.state.toeData.feet[this.state.selectedFootIndex].toes !== undefined &&
                                        this.state.toeData.feet[this.state.selectedFootIndex].toes.map((toe, id) =>
                                            this.printUploadedImagesForToe(id, toe, true))
                                    }
                                </tbody>
                            </Table>
                        </TableScrollbar>
                }
            </div>;
        //Pop up to confirm an image delete
        var deleteConfirmationModal =
            <Modal size="lg" show={this.state.showDeleteConfirmation} onHide={this.toggleDeleteConfirmation.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Are you SURE you want to delete this image?</Modal.Title>
                </Modal.Header>

                {/*The popup brings up a new almost identical table with a single row containing the image to be deleted*/}
                <Modal.Body>
                <TableScrollbar  className="table-scrollbar">
                    <Table striped bordered size="md" className="uploaded-image-table table-dark">
                        <thead>
                            <tr>
                                <th className="uploaded-image-table-image-header">Image</th>
                                <th className="uploaded-image-table-SameSize-header">Toe</th>
                                <th className="uploaded-image-table-SameSize-header">Fungal Coverage (%)</th>
                                <th className="uploaded-image-table-SameSize-header">Upload Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (this.state.toeData.feet !== undefined && this.state.toDeleteInfo.selectedFootIndex !== undefined) &&
                                this.printUploadedImageToBeDeleted()
                            }
                        </tbody>
                    </Table>
                    </TableScrollbar>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => this.toggleDeleteConfirmation()}>
                        No
                    </Button>
                    <Button variant="danger" onClick={() => this.deleteImage()}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>;

        //Pop up to edit an image's rotation
        var imageRotationModal =
            <Modal size="lg" show={this.state.showRotateModal} onHide={this.toggleShowRotateModal.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Rotate the image which way?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        {/*Rotate Right Button - Image - Rotate Left Button*/}
                        <div className="my-account-rotation-buttons-container">
                            <Button className="my-account-rotation-button" onClick={this.rotateImage.bind(this, false)}>
                                <img src={RotateRightIcon} className="my-account-rotation-button-logo" alt="Right" />
                            </Button>

                            <canvas ref={this.canvasRef} className="my-account-rotation-image" ></canvas>

                            <Button className="my-account-rotation-button" onClick={this.rotateImage.bind(this, true)}>
                                <img src={RotateLeftIcon} className="my-account-rotation-button-logo" alt="Left" />
                            </Button>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    {

                        this.state.rotationSaveStatus === ""
                            ?
                            <>
                                <Button variant="secondary" onClick={() => this.toggleShowRotateModal()}>
                                    Close
                            </Button>
                                <Button variant="danger" onClick={() => this.handleSave(this.state.toRotateInfo.imageName)}>
                                    Save
                            </Button>
                            </>
                            :
                            this.state.rotationSaveStatus //Print "Saving..." instead of the buttons
                    }
                </Modal.Footer>
            </Modal>

        return (
            <div className={!isMobile ? "my-account-page" : ""}>
                {
                    !isMobile && //Sidebare is only on desktop
                    <Sidebar {...this.props} />
                }

                {/* Main part */}
                <Container className={"my-account-main-container" + (isMobile ? "-mobile" : "")}>
                    {
                        !isMobile && //Only on desktop
                        <div className="welcome-bar">
                            <h6 className="welcome">My Account</h6>
                        </div>
                    }

                    <div className={!isMobile ? "my-account-sub-container" : ""}>
                        {
                            this.state.dataLoaded
                                ?
                                <>
                                    {/* Account Details Bubble */}
                                    {accountDetailsBubble}

                                    {/* Image Table Bubble - Only on Desktop */}
                                    {imageTableBubble}
                                </>
                                : //Display loading until the page is ready
                                <h4 test-id="loading" className="dashboard-loading">Loading...</h4>
                        }
                    </div>
                </Container>

                {/* Delete confirmation modal, only visible if showDeleteConfirmation = true */}
                {deleteConfirmationModal}

                {/* Modal for image rotation, only visible if showRotateModal = true */}
                {imageRotationModal}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    foot: state.foot
});

export default connect(mapStateToProps)(MyAccount);
