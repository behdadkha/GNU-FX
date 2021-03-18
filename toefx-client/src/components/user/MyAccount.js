/*
    Class for displaying the user's account details and uploaded images.
*/

import React, {Component} from 'react';
import {Container, Button, Table, Modal} from 'react-bootstrap';
import {isMobile} from "react-device-detect";
import {connect} from "react-redux";
import TableScrollbar from 'react-table-scrollbar';

import Axios from 'axios';

import {config} from "../../config";
import store from '../../Redux/store';
import {getAndSaveImages, getAndSaveToeData} from '../../Redux/Actions/setFootAction';
import {GetToeSymbolImage, GetDesktopFeetButtons, GetImageURLByName,
        TOE_COUNT, LEFT_FOOT_ID, RIGHT_FOOT_ID} from "../../Utils";
import Sidebar from "./Sidebar";

import '../../componentsStyle/MyAccount.css'

//TODO: Delete button should delete the image with confirmation before and after delete


class MyAccount extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            email: "", //The logged in user's email address
            imageUrls: [], //User's images
            toeData: [], //Data for user's images
            showLeftFoot: true, //Determine which foot to show images for
            showDeleteConfirmation: false,
            toDeleteInfo: {}, //{imageName, imageIndex in toeData, toeIndex, selectedFootindex }
            selectedFootIndex: LEFT_FOOT_ID, //Start by showing data for the left foot
            dataLoaded: false //Used for showing the loading screen until all data are loaded
        };
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
            imageUrls: this.props.foot.images,
            toeData: this.props.foot.toeData,
            dataLoaded: true, //Used to indicate whether or not a notification should be displayed to upload images before starting
            email: userInfo.email,
        });
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
        Rotates one of the user's uploaded images 90 degrees to the left.
        param imageName: The name of the image to rotate.
        param selectedFootIndex: The index of the selected foot to rotate, 0 for left foot and 1 for right foot.
        param toeIndex: The index of the selected toe to rotate, ranges from 0 to 4
        param imageIndex: The index of the image to rotate.
    */
    rotateImage(imageName, selectedFootIndex, toeIndex, imageIndex) {
        //TODO
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
            if (selectedFootIndex === LEFT_FOOT_ID
             || selectedFootIndex === RIGHT_FOOT_ID) {
                if (toeIndex >= 0 && toeIndex < TOE_COUNT) {
                    Axios.get(`${config.dev_server}/deleteImage?footIndex=${selectedFootIndex}&toeIndex=${toeIndex}&imageIndex=${imageIndex}&imageName=${imageName}`)
                        .then(() => {
                            var tempData = this.state.toeData;
                            tempData.feet[selectedFootIndex].toes[toeIndex].images.splice(imageIndex, 1);
                            this.setState({ toeData: tempData });
                            this.toggleDeleteConfirmation();
                        })
                }
            }
        }
        catch (error) {
            console.log(`Error deleting image: ${error}`);
        }
    }

    /*
        returns true if there exists any image to show
        param footIndex: 0 if left foot is being searched, 1 for right foot
    */
    existsAnyImageforFoot(footIndex) {

        if (this.state.toeData.feet) {//data is loaded
            let toeData = this.state.toeData.feet[footIndex].toes;

            for (let i = 0; i < toeData.length; i++) {
                if (toeData[i].images.length !== 0)
                    return true;
            }
        }
        else
            return false;

        return false;

    }

    /*
        toggles the showDeleteConfirmation to show or hide the confirmation modal
    */
    toggleDeleteConfirmation() {
        this.setState({
            showDeleteConfirmation: !this.state.showDeleteConfirmation
        });
    }

    /*
        Prints one of the user's uploaded images in the image list.
        param toeIndex: The toe toeIndex to be removed.
        param toe: The toe the image is for.
        param includeDelete_btn: if true, it includes the delete button. We dont need to show the delete button in the delete confirmation modal.
    */
    printUploadedImage(toeIndex, toe, includeDelete_btn = true) {
        //List is ordered by: Image, Toe Name, Fungal Coverage %, Upload Date
        var selectedFootIndex = this.whichFootSelected();
        return (
            toe.images.map(({name, date, fungalCoverage}, imageIndex) =>
                <tr key={toe + ' ' + toeIndex}>
                    <td className="uploaded-image-table-toe-image-col"
                        style={{backgroundImage: "url('" + GetImageURLByName(this.state.imageUrls, name) + "')"}}>
                    </td>
                    <td className="uploaded-image-table-col">
                        {GetToeSymbolImage(selectedFootIndex, toeIndex)}
                    </td>
                    <td className="uploaded-image-table-col">{fungalCoverage}</td>
                    <td className="uploaded-image-table-col">{date.split("T")[0]}</td>
                    <td className="uploaded-image-table-col">
                        <Button className="delete-image-button"
                                onClick={this.rotateImage.bind(this, name, selectedFootIndex, toeIndex, imageIndex)}>
                            Rotate
                        </Button>
                        <br/>
                        {!includeDelete_btn ?
                            <Button className="delete-image-button"
                                    onClick={() => {
                                        this.setState({
                                            toDeleteInfo: { imageName: name, imageIndex: imageIndex, toeIndex: toeIndex, selectedFootIndex: this.whichFootSelected() },
                                            showDeleteConfirmation: true
                                        });
                                    }}
                            >
                                Delete
                            </Button>
                            :
                            ""
                        }
                    </td>
                </tr>
            )
        )
    }

    /*
        returns 0 if the left foot is selected, 1 if the right foot is selected
    */
    whichFootSelected() {
        return (this.state.showLeftFoot) ? 0 : 1;
    }

    /*
        Displays the account page.
    */
    render() {
        var selectedFootIndex = this.whichFootSelected();

        //Bubble displaying user name, email, and option to reset password
        var accountDetailsBubble =
            <div className={"account-details" + (isMobile ? "-mobile" : "")}>
                <h3 className={"account-details-title" + (isMobile ? " account-details-title-mobile" : "")}>Account Details</h3>
                <h6 className={"account-details-name" + (isMobile ? " account-details-name-mobile" : "")}>{this.props.auth.user.name}</h6>
                <h6 className={"account-details-name" + (isMobile ? " account-details-name-mobile" : "")}>{this.state.email}</h6>

                <Button className="reset-password-button" onClick={this.navigateToResetPasswordPage.bind(this)}>Reset Password</Button>
            </div>;

        //Bubble for displaying the images the user uploaded previously
        //Display "Loading..." text while images are being retreived from the server
        var imageTableBubble =
            (!this.state.dataLoaded)
            ?
                <div className="uploaded-image-container"><h4>Loading...</h4></div>
            : (this.state.toeData.length === 0)
            ?
                <div className="uploaded-image-container"><h4>Press "+ Upload Image" to get started.</h4></div>
            :
                <div className="uploaded-image-container">
                    {
                        /* Buttons for changing which foot to view */
                        GetDesktopFeetButtons(this, selectedFootIndex)
                    }

                    {/* Actual Table */}
                    <TableScrollbar height="80vh" className="table-scrollbar">
                        <Table striped bordered size="md" className="uploaded-image-table table-dark">
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
                                    this.state.toeData.feet[selectedFootIndex].toes.map((toe, id) =>
                                        this.printUploadedImage(id, toe, selectedFootIndex), true)
                                }
                            </tbody>
                        </Table>
                    </TableScrollbar>
                </div>;

        return (
            <div className={!isMobile ? "my-account-page" : ""}>
                {
                    !isMobile && //Only on desktop
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
                            this.state.dataLoaded ?
                            <>
                                {/* Account Details Bubble */}
                                {accountDetailsBubble}

                                {/* Image Table Bubble */}
                                {
                                    !isMobile && //Only on desktop
                                        imageTableBubble
                                }
                            </>
                            : //Display loading until the page is ready
                                <h4 test-id="loading" className="dashboard-loading">Loading...</h4>
                        }
                    </div>
                </Container>

                {/* Delete confirmation modal, only visible if showDeleteConfirmation = true */}
                <Modal size="lg" show={this.state.showDeleteConfirmation} onHide={this.toggleDeleteConfirmation.bind(this)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Are you sure you want to delete the following cell?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <Table striped bordered size="md" className="uploaded-image-table">
                            <thead>
                                <tr>
                                    <th className="uploaded-image-table-image-header">Image</th>
                                    <th className="uploaded-image-table-SameSize-header">Toe</th>
                                    <th className="uploaded-image-table-SameSize-header">Fungal Coverage (%)</th>
                                    <th className="uploaded-image-table-SameSize-header">Upload Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(this.state.toeData.feet !== undefined && this.state.toDeleteInfo.selectedFootIndex !== undefined)  &&
                                    this.printUploadedImage(this.state.toDeleteInfo.toeIndex, this.state.toeData.feet[this.state.toDeleteInfo.selectedFootIndex].toes[this.state.toDeleteInfo.toeIndex], false)
                                }
                            </tbody>
                        </Table>

                    </Modal.Body>

                    <Modal.Footer>

                        <Button variant="secondary" onClick={() => this.toggleDeleteConfirmation()}>
                            Close
                        </Button>
                        <Button variant="danger" onClick={() => this.deleteImage()}>
                            Yes
                        </Button>

                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    foot: state.foot
});

export default connect(mapStateToProps)(MyAccount);
