/*
    Class for displaying the user's account details and uploaded images.
*/

import React, { Component } from 'react';
import { Button, Table } from 'react-bootstrap';
import { connect } from "react-redux";
import Axios from 'axios';

import { config } from "../../config";
import store from '../../Redux/store';
import { getAndSaveImages, getAndSaveToeData } from '../../Redux/Actions/setFootAction';
import { GetToeName, GetImageSrcByURLsAndName } from "../../Utils";
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
            age: 0, //The user's age
            imageUrls: [], //User's images
            toeData: [], //Data for user's images
            showLeftFoot: true //Determine which foot to show images for
        };
    }

    /*
        Logs the user out if they're not logged in.
        Otherwise loads the user's data from the server.
    */
    async componentDidMount() {
        //Redirect to login page if user not logged in
        if (!this.props.auth.isAuth)
            this.props.history.push("/login");

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
            email: userInfo.email,
            age: userInfo.age
        });
    }

    /*
        Redirects the user to a page where they can reset their password.
    */
    navigateToResetPasswordPage() {
        this.props.history.push('/user/resetPassword')
    }

    /*
        Changes which foot's images the user is viewing.
        param showLeftFoot: Show left foot images if true, right foot images otherwise.
    */
    viewFoot(showLeftFoot) {
        this.setState({
            showLeftFoot: showLeftFoot,
        });
    }

    /*
        Deletes one of the user's uploaded image.
        param imageName: The name of the image to delete.
        param selectedFootIndex: The index of the selected foot to delete, 0 for left foot and 1 for right foot.
        param toeIndex: The index of the selected toe to delete, ranges from 0 to 4
        param imageIndex: The index of the image to delete.
    */
    deleteImage(imageName, selectedFootIndex, toeIndex, imageIndex) {
        try {
        if (selectedFootIndex === 0 || selectedFootIndex === 1)
            if (toeIndex >= 0 && toeIndex <= 4) {
        
                Axios.get(`${config.dev_server}/deleteImage?footIndex=${selectedFootIndex}&toeIndex=${toeIndex}&imageIndex=${imageIndex}&imageName=${imageName}`)
                    .then(() => {
                        window.location.reload();
                    })
    
            }
        } catch {
            console.log("Couldnt complete the request");
        }
    }

    /*
        Prints one of the user's uploaded images in the image list.
        param id: The toe id to be removed.
        param toe: The toe the image is for.
        param selectedFootIndex: which foot the image is for.
    */
    printUploadedImage(id, toe, selectedFootIndex) {
        //List is ordered by: Image, Toe Name, Fungal Coverage %, Upload Date
        return (
            toe.images.map(({ name, date, fungalCoverage }, index) =>
                <tr key={toe + ' ' + index}>
                    <td><img src={GetImageSrcByURLsAndName(this.state.imageUrls, name)} alt="Loading..."
                        className="uploaded-image-table-toe-image" /></td>
                    <td>{GetToeName(id)}</td>
                    <td>{fungalCoverage}</td>
                    <td>{date.split("T")[0]}</td>
                    <td><Button className="delete-image-button" onClick={this.deleteImage.bind(this, name, selectedFootIndex, id, index)}>Delete</Button></td>
                </tr>
            )
        )
    }

    /*
        Displays the account page.
    */
    render() {
        var imagesAreLoaded = this.state.toeData.feet; //Images have been retrieved from the server
        var defaultFootButtonClass = "graph-foot-button"; //The general CSS for the feet buttons
        var activeFootButtonClass = defaultFootButtonClass + " active-toe-button"; //The foot button that's selected
        var selectedFootIndex = (this.state.showLeftFoot) ? 0 : 1; //0 -> left foot, 1 -> right foot

        //Bubble displaying user name, email, and option to reset password
        var accountDetailsBubble =
            <div className="account-details">
                <h6 className="account-details-title">Account Details</h6>
                <h6 className="account-details-name">{this.props.auth.user.name}</h6>
                <h6 className="account-details-name" >{this.state.email}</h6>

                <Button className="reset-password-button" onClick={this.navigateToResetPasswordPage.bind(this)}>Reset Password</Button>
            </div>;

        //Bubble for displaying the images the user uploaded previously
        //Display "Loading..." text while images are being retreived from the server
        var imageTableBubble = (!imagesAreLoaded) ? <div className="uploaded-image-container"><h4>Loading...</h4></div>
            : <div className="uploaded-image-container">
                {/* Buttons for changing which foot to view */}
                <div className="graph-feet-buttons">
                    <button onClick={this.viewFoot.bind(this, true)}
                        className={(this.state.showLeftFoot ? activeFootButtonClass : defaultFootButtonClass)}>
                        Left Foot
                    </button>

                    <button onClick={this.viewFoot.bind(this, false)}
                        className={(!this.state.showLeftFoot ? activeFootButtonClass : defaultFootButtonClass)}>
                        Right Foot
                    </button>
                </div>

                {/* Actual Table */}
                <Table striped bordered size="md" className="uploaded-image-table">
                    <thead>
                        <tr>
                            <th className="uploaded-image-table-image-header">Image</th>
                            <th>Toe</th>
                            <th>Fungal Coverage (%)</th>
                            <th>Upload Date</th>
                            <th>Delete?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            //Print a list of images with data
                            this.state.toeData.feet[selectedFootIndex].toes.map((toe, id) => this.printUploadedImage(id, toe, selectedFootIndex))

                        }
                    </tbody>
                </Table>
            </div>;

        return (
            <div className="my-account-page">
                <Sidebar {...this.props} />

                {/* Main part */}
                <div className="my-account-main-container">
                    <div className="welcome-bar">
                        <h6 className="welcome">My Account</h6>
                    </div>

                    <div className="my-account-sub-container">
                        {/* Account Details Bubble */}
                        {accountDetailsBubble}

                        {/* Image Table Bubble */}
                        {imageTableBubble}
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    foot: state.foot
});

export default connect(mapStateToProps)(MyAccount);
