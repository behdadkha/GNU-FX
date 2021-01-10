/*
    Class for displaying the user's account details and uploaded images.
*/

import React, {Component} from 'react';
import {Button, Table} from 'react-bootstrap';
import {connect} from "react-redux";
import {config} from "../../config";
import Axios from 'axios';
import store from '../../Redux/store';
import { getAndSaveImages } from '../../Redux/Actions/setFootAction';
import Sidebar from "./Sidebar";
import { GetToeName, GetImageSrcByURLsAndName } from "../Util";
import '../../componentsStyle/MyAccount.css'


//TOOD: Delete button should actually delete the image with confirmation before and after delete

class MyAccount extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            email: "", //The logged in user
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

        //Redux data gets erased after a refresh. so if the data is gone we need to get it again
        if (this.props.foot.images.length === 0) {
            await store.dispatch(getAndSaveImages());
            this.setState({
                imageUrls : this.props.foot.images
            });
        }
        else {
            this.setState({
                imageUrls : this.props.foot.images
            });
        }

        //Get the user's toe data from the node server
        await Axios.get(`${config.dev_server}/getToe`)
            .then((data) => {
                this.setState({
                    toeData: data.data
                })
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
        param name: The name of the image to delete.
    */
    deleteImage(name) {
        //TODO
    }

    /*
        Prints one of the user's uploaded images in the image list.
        param id: The list id for react.
        param toe: Which toe the image is for.
        param selectedFootIndex: Which foot the image is for.
    */
    printUploadedImage(id, toe, selectedFootIndex) {
        //List is ordered by: Image, Toe Name, Fungal Coverage %, Upload Date
        return (
            toe.images.map(({name, date}, index) => 
                <tr key={id + ' ' + index}>
                    <td><img src={GetImageSrcByURLsAndName(this.state.imageUrls, name)} alt="Loading..."
                             className="uploaded-image-table-toe-image"/></td>
                    <td>{GetToeName(id)}</td>
                    <td>FILL IN FUNGAL COVERAGE</td>
                    <td>{date.split("T")[0]}</td>
                    <td><Button className="delete-image-button" onClick={this.deleteImage.bind(this, name)}>Delete</Button></td>
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
        var selectedFootIndex =  (this.state.showLeftFoot) ? 0 : 1; //0 -> left foot, 1 -> right foot

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
                        this.state.toeData.feet[selectedFootIndex].toes.map((toe,id) => this.printUploadedImage(id, toe, selectedFootIndex))
                    }
                    </tbody>
                </Table>
            </div>;

        return (
            <div className="my-account-page">
                <Sidebar {...this.props}/>
                <div className="welcome-bar">
                    <h6 className="welcome">My Account</h6>
                </div>

                {/* Main part */}
                <div className="my-account-main-container">
                    {/* Account Details Bubble */}
                    {accountDetailsBubble}

                    {/* Image Table Bubble */}
                    {imageTableBubble}
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
