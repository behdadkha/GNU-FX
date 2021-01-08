/*
    Class for displaying the user's account details.
*/

import React, {Component} from 'react';
import {Button, Table} from 'react-bootstrap';
import {connect} from "react-redux";
import {config} from "../../config";
import Sidebar from "./Sidebar";
import Axios from 'axios';
import '../../componentsStyle/MyAccount.css'


class MyAccount extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            imageUrls: [],
        };
    }

    /*
        Logs the user out if they're not logged in.
        Otherwise loads the user's data from the server.
    */
    /*async componentDidMount() {
        if (!this.props.auth.isAuth) { //If user is not logged in, go to the login page
            this.props.history.push("/login");
        }
        else { //Otherwise load their data from the server
            await Axios.get(`${config.dev_server}/user/getUserInfo`)
                .then((data) => {
                    this.setState({
                        email: data.data
                    });
                }
            );
        }
    }*/
    async componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            this.props.history.push("/login");

        
        await Axios.get(`${config.dev_server}/getImageNames`)
            .then(async (imageNames) => {

                //get all the user's images and store them in a data array
                for (let i = 0; i < imageNames.data.length; i++) {
                    await Axios.get(`${config.dev_server}/getImage?imageName=${imageNames.data[i]}`, { responseType: "blob" })
                        .then((image) => {
                            this.setState({
                                imageUrls: [...this.state.imageUrls, { imageName: imageNames.data[i], url: URL.createObjectURL(image.data) }]
                            });
                        });
                }

            });


        //get the user's toe data from the node server
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
        Prints one of the user's uploaded images in the list.
    */
    printUploadedImage(id, url) {
        return (
            <tr key={id}>
                <td>Dummy</td>
                <td>Dummy</td>
                <td>Dummy</td>
                <td>No Date</td>
            </tr>
        )
    }

    /*
        Displays the account page.
    */
    render() {
        return (
            <div style={{ overflow: "hidden" }}>
                <Sidebar {...this.props}/>
                <div className="welcome-bar">
                    <h6 className="welcome">My Account</h6>
                </div>

                {/* Main part */}
                <div className="my-account-main-container">
                    
                    {/* Account Details Bubble */}
                    <div className="account-details">
                        <h6 className="account-details-title">Account Details</h6>
                        <h6 className="account-details-name">{this.props.auth.user.name}</h6>
                        <h6 className="account-details-name" >{this.state.email}</h6>

                        <Button className="reset-password-button" onClick={this.navigateToResetPasswordPage.bind(this)}>Reset Password</Button>
                    </div>

                    {/* Image Table Bubble */}
                    <div className="account-images">
                        <Table striped bordered size="md" className="uploaded-image-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Foot</th>
                                    <th>Toe</th>
                                    <th>Upload Date</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.imageUrls.map((url, id) => this.printUploadedImage(id, url))
                            }
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(MyAccount);
