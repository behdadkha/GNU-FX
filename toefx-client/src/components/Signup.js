/*
    Class for the form user's can use to sign up for the site.
*/

import React, { Component } from "react";
import { Col, Row, Container, Form, Button } from "react-bootstrap";
import { isMobile } from 'react-device-detect';
import Axios from 'axios';

import { config } from "../config";
import { isValidInput, isValidEmail } from "../Utils";

import "../componentsStyle/Signup.css";
import healthydrawing from "../icons/MedicalCare.svg";
import CheckMark from "../icons/checkmark.png";
import CrossMark from "../icons/crossmark.png"

//Error messages displayed to the user
const gErrorMessages = {
    "": "",
    "BLANK_FIELD": "Please fill in all fields.",
    "PASSWORD_MISMATCH": "Please make sure passwords match.", 
    "INVALID_EMAIL": "Please enter a valid email address.",
    "INVALID_PASSWORD": "Please enter a valid password.", 
    "NO_SERVER_CONNECTION": "Couldn't connect to server.",
    "ACCOUNT_EXISTS": "That email is already in use. Please choose another.",
}

//TODO: Age field should really be birthday.
//TODO: Error handling for when there's no internet connection.

export default class Signup extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            name: "", //User's name input
            email: "", //User's email input
            password: "", //User's password input
            confirmedPassword: "", //User's confirmed password input
            age: "", //User's age input
            errorMessage: "", //The type of error message to display (if any)
        };
    }

    /*
        Processes the user's sign up submission. Redirects to the login page upon a successful submission.
        param e: The sign up submission event.
    */
    handleSignup = async (e) => {
        e.preventDefault(); //Prevents page reload on form submission

        if (this.isAnyFieldLeftBlank()) {
            this.setState({errorMessage: "BLANK_FIELD"});
            return; //A field was left blank so don't finalize sign up
        }

        if (this.passwordMismatch()) {
            this.setState({errorMessage: "PASSWORD_MISMATCH"});
            return; //User's password and confirm password field don't match
        }

        if (!isValidEmail(this.state.email)) {
            this.setState({errorMessage: "INVALID_EMAIL"});
            return; //User didn't enter a proper email
        }

        if (!isValidInput(this.state.password)
        || !(this.isPasswordLengthStrong() && this.doesPasswordHaveUpperandLowerCase() && this.doesPasswordHaveNumber())) {
            this.setState({errorMessage: "INVALID_PASSWORD"})
            return; //User didn't enter proper passwords
        }

        //Try to sign up the user
        let response;

        try {
            response = await Axios.post(`${config.dev_server}/signup`, {
                name: this.state.name,
                email: this.state.email,
                password: this.state.password,
                age: this.state.age
            })
        }
        catch (res) { //No internet connection
            this.setState({errorMessage: "ACCOUNT_EXISTS"});
            return;
        }

        //Process response from server
        if (response.status === 200) { //Sign-up was a success
            //Redirect to login page
            this.props.history.push('/login');
            window.location.reload(); //Update nav bar

        }
        else { //Account already exists
            this.setState({errorMessage: "ACCOUNT_EXISTS"});
        }
    }

    /*
        Checks if the user didn't fill out all fields on the form.
        returns: true if there is an empty field, false if all fields are filled in.
    */
    isAnyFieldLeftBlank() {
        return this.state.name === ""
            || this.state.email === ""
            || this.state.password === ""
            || this.state.confirmedPassword === ""
            || this.state.age === "";
    }

    /*
        Checks if the user's confirmed password doesn't match their password.
        returns: true if the user's input password and confirmed password don't match, false otherwise.
    */
    passwordMismatch() {
        return this.state.password !== this.state.confirmedPassword;
    }

    /*
        Checks if the user entered a password of required length.
        returns: true if the user's input password is long enough, false otherwise.
    */
    isPasswordLengthStrong() {
        return this.state.password.length >= 8; //Min 8 characters.
    }

    /*
        Checks if the user entered a password with both a lowercase and uppercase letter.
        returns: true if the user's input password has both a lowercase and uppercase letter, false otherwise.
    */
    doesPasswordHaveUpperandLowerCase() {
        return this.state.password.match(/[a-z]+/) && this.state.password.match(/[A-Z]+/);
    }

    /*
        Checks if the user entered a password with a number.
        returns: true if the user's input password has a number, false otherwise.
    */
    doesPasswordHaveNumber() {
        return this.state.password.match(/[0-9]+/);
    }

    /*
        Updates the age field as the user types their input.
    */
    updateAge(age) {
        if (age !== "") //Don't modify the input if the user is trying to wipe the field
            age = Math.min(Math.max(1, age.toString()), 150); //Force a number between 1 and 150

        this.setState({age: age});
    }

    /*
        Gets the appropriate text to display to the user upon an error.
        returns: Error text if error exists.
    */
    getErrorText() {
        return <h6>{gErrorMessages[this.state.errorMessage]}</h6>;
    }

    /*
        Print sign up page.
    */
    render() {
        var inputErrorClass = "signup-error-input"; //Used to colour boxes with mistakes in pink
        var signUpError = this.getErrorText();
        var titleMessage = !isMobile ? <h4>Join us to <span className="signup-form-join-message">show off your toenails</span></h4> : []; //Don't show on mobile
        var showPicture = !isMobile && window.innerWidth >= 1000;

        return (
            <div>
                {showPicture ? <img src={healthydrawing} className="signup-picture" alt="" /> : ""}

                <Container className="shadow p-3 mb-1 bg-white rounded" id={"signup-form-container" + (!showPicture ? "-mobile" : "")}>
                    <h2 className="signup-form-title">Sign Up</h2>
                    {titleMessage}

                    <Row>
                        <Col>
                            {/* Error message if needed */}
                            <div className="signup-error">
                                {signUpError}
                            </div>

                            <Form className={"signup-form" + (!showPicture ? "-mobile" : "")} onSubmit={this.handleSignup.bind(this)}>

                                {/* Email Input */}
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="example@gmail.com"
                                        autoComplete="email"
                                        value={this.state.email}
                                        onChange={(e) =>
                                            this.setState({email: e.target.value})
                                        }
                                        className={(this.state.errorMessage === "BLANK_FIELD" && this.state.email === "")
                                            || this.state.errorMessage === "INVALID_EMAIL"
                                            || this.state.errorMessage === "ACCOUNT_EXISTS" ? inputErrorClass : ""}
                                    />
                                    <Form.Text className="text-muted">
                                        Your email is secure in our hands.
                                    </Form.Text>
                                </Form.Group>

                                {/* Password Input */}
                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Example123"
                                        autoComplete="new-password"
                                        value={this.state.password}
                                        onChange={(e) => {this.setState({ password: e.target.value })}}
                                        className={(this.state.errorMessage === "BLANK_FIELD" && this.state.password === "")
                                            || this.state.errorMessage === "INVALID_PASSWORD"
                                            || this.state.errorMessage === "PASSWORD_MISMATCH" ? inputErrorClass : ""}
                                    />

                                    {/* Confirmations of good password */}
                                    <Form.Label className="strong-password-desc">
                                        <Form.Text className="text-muted">
                                            {
                                                this.isPasswordLengthStrong()
                                                ? <img src={CheckMark} className="password-check-mark" alt="checkmark"/>
                                                : <img src={CrossMark} className="password-check-mark" alt="crossmark"/>
                                            }
                                           {" Password must be at least 8 characters long."} {/*Writing it in a string keeps the space at the front*/}
                                        </Form.Text>
                                    </Form.Label>
                                    <Form.Label className="strong-password-desc">
                                        <Form.Text className="text-muted">
                                            {
                                                this.doesPasswordHaveUpperandLowerCase()
                                                ? <img src={CheckMark} className="password-check-mark" alt="checkmark"/>
                                                : <img src={CrossMark} className="password-check-mark" alt="crossmark"/>
                                            }
                                            {" Password must contain uppercase (A-Z) and lowercase (a-z) characters."}
                                        </Form.Text>
                                    </Form.Label>
                                    <br></br>
                                    <Form.Label >
                                        <Form.Text className="text-muted">
                                            {
                                                this.doesPasswordHaveNumber()
                                                ? <img src={CheckMark} className="password-check-mark" alt="checkmark"/>
                                                : <img src={CrossMark} className="password-check-mark" alt="crossmark"/>
                                            }
                                            {" Password must contain a number (0-9)."}
                                        </Form.Text>
                                    </Form.Label>
                                </Form.Group>

                                {/* Confirm Password Input */}
                                <Form.Group controlId="formBasicConfirmPassword" className="confirm-password-input">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Example123"
                                        autoComplete="new-password"
                                        value={this.state.confirmedPassword}
                                        onChange={(e) =>
                                            this.setState({confirmedPassword: e.target.value})
                                        }
                                        className={(this.state.errorMessage === "BLANK_FIELD" && this.state.password === "")
                                            || this.state.errorMessage === "INVALID_PASSWORD"
                                            || this.state.errorMessage === "PASSWORD_MISMATCH" ? inputErrorClass : ""}
                                    />
                                </Form.Group>

                                {/* Full Name Input */}
                                <Form.Group controlId="formName">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Bob Smith"
                                        autoComplete="name"
                                        value={this.state.name}
                                        onChange={(e) =>
                                            this.setState({name: e.target.value})
                                        }
                                        className={(this.state.errorMessage === "BLANK_FIELD" && this.state.name === "") ? inputErrorClass : ""}
                                    />
                                </Form.Group>

                                {/* Age Input */}
                                <Form.Group controlId="formAge">
                                    <Form.Label>Age</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="50"
                                        value={this.state.age}
                                        onChange={(e) => this.updateAge(e.target.value)}
                                        className={(this.state.errorMessage === "BLANK_FIELD" && this.state.age === "") ? inputErrorClass : ""}
                                    />
                                </Form.Group>

                                {/* Sign Up Button */}
                                <div style={{ textAlign: "center" }}>{/* This has to be in-line css to over write the bootstrap */}
                                    <Button variant="primary" type="submit">
                                        Create Account
                                </Button>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

