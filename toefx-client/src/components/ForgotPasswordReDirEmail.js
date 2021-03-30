/*
    Class for the form accessed via a password recovery link.
*/

import React, {Component} from "react";
import {Container, Row, Col, Form, Button} from "react-bootstrap";
import {isMobile} from 'react-device-detect';
import Axios from "axios";

import {config} from "../config";
import {LogOutUser} from '../Redux/Actions/authAction';
import store from '../Redux/store';
import {IsValidEmail, IsGoodPassword, GetGoodPasswordConfirmations} from "../Utils";

import "../componentsStyle/ForgotPassword.css";
import "../componentsStyle/SignUp.css"; //Reuse CSS from sign up page

//Error messages displayed to the user
const gErrorMessages = {
    "": "",
    "BLANK_FIELD": "Please fill in all fields.",
    "PASSWORD_MISMATCH": "Please make sure passwords match.", 
    "INVALID_EMAIL": "Please enter the correct email address.",
    "INVALID_PASSWORD": "Please enter a valid password.", 
    "NO_SERVER_CONNECTION": "Could not connect to server.",
    "UNKNOWN_ERROR": "An unknown error occurred."
}


export default class ForgotPasswordReDirEmail extends Component {
    /*
        Sets base data for the page.
    */
    constructor() {
        super();

        this.state = {
            emailFromUrl: "", //The user's actual email extracted from their recovery link
            email: "", //The user's input email to make sure they're using their recovery link
            password: "", //The user's input password
            confirmPassword: "", //The user's input confirmed password
            errorMessage: "", //The error message type displayed to the user if any
            successMessage: "", //The message displayed to the user upon successful password recovery
        };
    }

    /*
        Sets up the user's email based on their link when the page is loaded.
    */
    componentDidMount() {
        var path = window.location.pathname;
        path = path.split("/forgotpassword/")[1];
        this.setState({emailFromUrl: path.trim()});
        store.dispatch(LogOutUser()); //Log out a user if one was already logged in
    }

    /*
        Processes the user's password change. Redirects to the login page upon a successful submission.
        param e: The password reset submission event.
    */
    handlePasswordChange = async (e) => {
        e.preventDefault(); //Prevents page reload on form submission

        if (this.isAnyFieldLeftBlank()) {
            this.setState({errorMessage: "BLANK_FIELD"});
            return; //A field was left blank so don't finalize password reset
        }

        if (this.passwordMismatch()) {
            this.setState({errorMessage: "PASSWORD_MISMATCH"});
            return; //User's password and confirm password field don't match
        }

        if (!IsValidEmail(this.state.email)) { //Matching with original email is done by server
            this.setState({errorMessage: "INVALID_EMAIL"});
            return; //User didn't enter the email this link is for
        }

        if (!IsGoodPassword(this.state.password)) {
            this.setState({errorMessage: "INVALID_PASSWORD"})
            return; //User didn't enter proper passwords
        }

        //Try to reset the user's password
        let response;

        try {
            response = await Axios.post(`${config.dev_server}/forgotpassword/checkEmails`, {
                emailFromURL: this.state.emailFromUrl,
                emailInput: this.state.email.toLowerCase(), //Emails are always saved lowercase
                password: this.state.password,
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
            setTimeout(function () {
                window.location.href = "/login"; //Redirect to login page after 4 seconds
            }, 4000)
        } 
    }

    /*
        Checks if the user didn't fill out all fields on the form.
        returns: true if there is an empty field, false if all fields are filled in.
    */
        isAnyFieldLeftBlank() {
            return this.state.email === ""
                || this.state.password === ""
                || this.state.confirmPassword === "";
        }

    /*
        Checks if the user's confirmed password doesn't match their password.
        returns: true if the user's input password and confirmed password don't match, false otherwise.
    */
    passwordMismatch() {
        return this.state.password !== this.state.confirmPassword;
    }

    /*
        Gets the appropriate text to display to the user upon an error.
        returns: Error text if error exists.
    */
    getErrorText() {
        return gErrorMessages[this.state.errorMessage];
    }

    /*
        Print the special reset password page.
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

                            {/* Email Input */}
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="example@gmail.com"
                                    autoComplete="email"
                                    value={this.state.email}
                                    onChange={(e) => this.setState({email: e.target.value.trim()})}
                                    className={(this.state.errorMessage === "BLANK_FIELD" && this.state.email === "")
                                        || this.state.errorMessage === "INVALID_EMAIL" ? inputErrorClass : ""}
                                />
                            </Form.Group>

                            {/* Password Input */}
                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Example123"
                                    autoComplete="new-password"
                                    value={this.state.password}
                                    onChange={(e) => {this.setState({password: e.target.value})}}
                                    className={(this.state.errorMessage === "BLANK_FIELD" && this.state.password === "")
                                        || this.state.errorMessage === "INVALID_PASSWORD"
                                        || this.state.errorMessage === "PASSWORD_MISMATCH" ? inputErrorClass : ""}
                                />

                                {/* Confirmations of good password */}
                                {GetGoodPasswordConfirmations(this.state.password)}
                            </Form.Group>

                            {/* Confirm Password Input */}
                            <Form.Group controlId="formBasicConfirmPassword">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Example123"
                                    autoComplete="new-password"
                                    value={this.state.confirmPassword}
                                    onChange={(e) => this.setState({confirmPassword: e.target.value})}
                                    className={(this.state.errorMessage === "BLANK_FIELD" && this.state.confirmPassword === "")
                                        || this.state.errorMessage === "INVALID_PASSWORD"
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
