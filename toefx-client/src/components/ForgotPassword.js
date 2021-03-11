/*
    Class for the form users can use to send themselves a password recovery link.
*/

import React, {Component} from "react";
import {Container, Row, Col, Form, Button} from "react-bootstrap";
import {isMobile} from "react-device-detect";
import Axios from "axios";

import {config} from "../config";
import {IsValidEmail} from "../Utils";

import forgotpasswordIcon from "../icons/forgotpassword.svg";
import "../componentsStyle/Login.css"; //Reuse the CSS from the login form
import "../componentsStyle/ForgotPassword.css";

//Error messages displayed to the user
const gErrorMessages = {
    "": "",
    "INVALID_EMAIL": "Invalid email address.",
    "NO_SERVER_CONNECTION": "Couldn't connect to server.",
    "UNKNOWN_ERROR": "An unknown error occured."
}

export default class ForgotPassword extends Component {
    /*
        Sets base data for the page.
    */
    constructor() {
        super();

        this.state = {
            email: "",
            ValidUser: false,
            errorMessage: "",
            successMessage: "",
            loadingMessage: "",
        };
    }

    /*
        Confirms if the user entered a valid email or not.
        param e: The email submission event.
    */
    handleSubmit = async (e) => {
        e.preventDefault(); //Don't reload the page on form submission

        //Check if user entered bad email
        if (!IsValidEmail(this.state.email)) {
            this.setState({
                //email: "", //Don't clear email in case user made a small typo
                errorMessage: "INVALID_EMAIL",
            });

            return; //Don't actually process
        }

        //User input passed basic checks so submit data to server
        let response;

        try {
            this.setState({loadingMessage: "Sending email..."})
            response = await Axios.post(`${config.dev_server}/forgotpassword`, {
                email: this.state.email,
            })
        }
        catch (e) {
            this.setState({
                loadingMessage: "",
                errorMessage: "INVALID_EMAIL",
            });

            return;
        }

        if (response.data.msg !== "")
            this.setState({
                loadingMessage: "",
                errorMessage: response.data.msg,
            });
        else {
            this.setState({
                loadingMessage: "",
                errorMessage: "", //Remove old messages
                successMessage: `A recovery link has been sent to ${this.state.email}.`,
            }); 
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
        Displays the forgot password page.
    */
    render() {
        var titleClass = "login-form-title" + (isMobile ? " login-form-title-mobile" : "");
        var containerClass = "p-3 mb-5" + (!isMobile ? " bg-white shadow rounded" : "");

        return (
            <div>
                <div className="login-logo-container">
                    {isMobile? '' : <img src={forgotpasswordIcon} className="login-logo"  alt=""/>} {/*Remove image on mobile*/}
                </div>

                <Container className={containerClass} id={"login-container" + (isMobile ? "-mobile" : "")}>
                    <h3 className={titleClass}>Forgot your password?</h3>
                    <h5 className={titleClass}>It happens to the best of us.</h5>

                    <Row>
                        <Col> {/* Needed so error message always has space */}
                            {/* Error message if needed */}
                            <div className="login-form-error">
                                <h6 className="error-text">{this.getErrorText()}</h6>
                            </div>

                            {
                                this.state.successMessage !== "" ? //Password has been reset
                                    <div className="forgot-password-confirmation-text">
                                        {this.state.successMessage}
                                    </div>
                                :
                                    <Form className="login-form" onSubmit={this.handleSubmit.bind(this)}>
                                        {/* Email Input */}
                                        <Form.Group controlId="formBasicEmail">
                                            <Form.Label>Email Address</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder=""
                                                autoComplete="email"
                                                value={this.state.email}
                                                onChange={(e) => this.setState({email: e.target.value, errorMessage: ""})}
                                            />
                                        </Form.Group>

                                        {/* Submission Button*/}
                                        {
                                            this.state.loadingMessage !== "" ?
                                                <h4 className="forgot-password-sending-text">{this.state.loadingMessage}</h4>
                                            :
                                                <Button className="login-button" type="submit">
                                                    Email Recovery Link
                                                </Button>
                                        }
                                    </Form>
                            }
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}
