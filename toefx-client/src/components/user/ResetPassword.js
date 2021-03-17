/*
    A class for helping the user reset their password.
*/

import React, {Component} from 'react'
import {Container, Row, Col, Form, Button} from "react-bootstrap";
import {isMobile} from 'react-device-detect';
import {connect} from "react-redux";
import Axios from 'axios';

import {config} from "../../config";
import {LogOutUser} from '../../Redux/Actions/authAction';
import store from '../../Redux/store';
import {IsGoodPassword, GetGoodPasswordConfirmations} from "../../Utils";

import "../../componentsStyle/ForgotPassword.css"; //Reuse CSS from forgot password page
import '../../componentsStyle/ResetPassword.css';
import "../../componentsStyle/Signup.css"; //Reuse CSS from sign up page

//Error messages displayed to the user
const gErrorMessages = {
    "": "",
    "BLANK_FIELD": "Please fill in all fields.",
    "INVALID_CURRENT_PASSWORD": "Please make sure your current password is correct.",
    "PASSWORD_MISMATCH": "Please make sure new passwords match.",
    "INVALID_PASSWORD": "Please enter a valid password.",
    "CHANGE_PASSWORD": "Please enter a new password.",
    "NO_SERVER_CONNECTION": "Could not connect to server.",
    "UNKNOWN_ERROR": "An unknown error occurred."
}


class ResetPassword extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            currentPassword: "", //User's current password input
            newPassword: "", //User's new password input
            confirmNewPassword: "", //User's new password confirmed input
            errorMsg: "", //Error message type if any
            successMessage: "" //Message to be displayed to user after successful password change
        };
    }

    /*
        Redirects the user to the login page if they're not logged in.
    */
    componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            window.location.href = "/login";
    }

    /*
        Checks if the user didn't fill out all fields on the form.
        returns: true if there is an empty field, false if all fields are filled in.
    */
    isAnyFieldLeftBlank() {
        return this.state.currentPassword === ""
            ||  this.state.newPassword === ""
            ||  this.state.confirmNewPassword === "";
    }

    /*
        Checks if the user's new password doesn't match the confirmed new password.
        returns: true if the user's input new password and confirmed password don't match, false otherwise.
    */
    passwordMismatch() {
        return this.state.newPassword !== this.state.confirmNewPassword;
    }

    /*
        Checks if the user's new password is the same as their old password.
        returns: true if the user's input new password and input current password match.
    */
    newPasswordMatchesOldPassword() {
        return this.state.newPassword === this.state.currentPassword;
    }

    /*
        Processes the user's reset password submission. Redirects to the login page upon a successful submission.
        param e: The rest password submission event.
    */
    async handlePasswordChange(e) {
        e.preventDefault(); //Prevents page reload on form submission

        if (this.isAnyFieldLeftBlank()) {
            this.setState({errorMessage: "BLANK_FIELD"});
            return; //A field was left blank so don't finalize password reset
        }

        if (this.passwordMismatch()) {
            this.setState({errorMessage: "PASSWORD_MISMATCH"});
            return; //User's password and confirm password field don't match
        }

        if (!IsGoodPassword(this.state.newPassword)) {
            this.setState({errorMessage: "INVALID_PASSWORD"})
            return; //User didn't enter proper passwords
        }

        if (this.newPasswordMatchesOldPassword()) {
            this.setState({errorMessage: "CHANGE_PASSWORD"})
            return; //User didn't actually try changing their password
        }

        //Try to reset the password
        let response;
        try {
            response = await Axios.post(`${config.dev_server}/user/resetPassword`, {
                currentPassword: this.state.currentPassword,
                newPassword: this.state.newPassword,
            })
        }
        catch (response) { //Some error occurred
            console.log(response);
            this.setState({errorMessage: "UNKNOWN_ERROR"});
            return;
        }

        this.setState({
            errorMessage: response.data.errorMsg,
            successMessage: response.data.errorMsg === "" ? "Your password was reset! You will be returned to the login page shortly." :  "",
        });

        if (response.data.errorMsg === "") { //Password reset was success
            store.dispatch(LogOutUser()); //Sign out user so they can't just change pages

            setTimeout(function () {
                window.location.href = "/login"; //Redirect to login page after 4 seconds
            }, 4000)
        }
    }

    /*
        Gets the appropriate text to display to the user upon an error.
        returns: Error text if error exists.
    */
    getErrorText() {
        return gErrorMessages[this.state.errorMessage];
    }

    /*
        Prints the reset password page.
    */
    render() {
        var titleClass = "signup-form-title" + (isMobile ? " signup-form-title-mobile" : "");
        var inputErrorClass = "signup-error-input"; //Used to colour boxes with mistakes in pink

        return (
            <Container className={"p-3" + (!isMobile ? " mb-1 bg-white shadow rounded" : " mb-3")}
                            id="signup-form-container-mobile"
            >
                <h3 className={titleClass}>Reset Password</h3>

                <Row>
                    <Col>
                    
                        {/* Error message if needed */}
                        <div className="signup-error">
                            <h6 className="error-text">{this.getErrorText()}</h6>
                        </div>

                        {
                            //Only show succress message after the password has been reset
                            this.state.successMessage !== "" ?
                                <div className="forgot-password-confirmation-text">
                                    {this.state.successMessage}
                                </div>
                        :
                        <Form className={"signup-form" + (isMobile ? "-mobile" : "")} onSubmit={this.handlePasswordChange.bind(this)}>

                            {/* Current Password Input */}
                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Old Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder=""
                                    autoComplete="current-password"
                                    value={this.state.currentPassword}
                                    onChange={(e) => this.setState({currentPassword: e.target.value})
                                    }
                                    className={(this.state.errorMessage === "BLANK_FIELD" && this.state.currentPassword === "")
                                        || this.state.errorMessage === "INVALID_CURRENT_PASSWORD" ? inputErrorClass : ""}
                                />
                            </Form.Group>

                            {/* New Password Input */}
                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Example123"
                                    autoComplete="new-password"
                                    value={this.state.password}
                                    onChange={(e) => {this.setState({newPassword: e.target.value})}}
                                    className={(this.state.errorMessage === "BLANK_FIELD" && this.state.newPassword === "")
                                        || this.state.errorMessage === "INVALID_PASSWORD"
                                        || this.state.errorMessage === "CHANGE_PASSWORD"
                                        || this.state.errorMessage === "PASSWORD_MISMATCH" ? inputErrorClass : ""}
                                />

                                {/* Confirmations of good password */}
                                {GetGoodPasswordConfirmations(this.state.newPassword)}
                            </Form.Group>

                            {/* Confirm Password Input */}
                            <Form.Group controlId="formBasicConfirmPassword">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Example123"
                                    autoComplete="new-password"
                                    value={this.state.confirmPassword}
                                    onChange={(e) => this.setState({confirmNewPassword: e.target.value})}
                                    className={(this.state.errorMessage === "BLANK_FIELD" && this.state.confirmNewPassword === "")
                                        || this.state.errorMessage === "INVALID_PASSWORD"
                                        || this.state.errorMessage === "CHANGE_PASSWORD"
                                        || this.state.errorMessage === "PASSWORD_MISMATCH" ? inputErrorClass : ""}
                                />
                            </Form.Group>

                            <Button className="signup-button" type="submit">
                                Reset Password
                            </Button>
                        </Form>
                        }
                        </Col>
                    </Row>
            </Container>
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(ResetPassword);
