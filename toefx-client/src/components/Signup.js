/*
    Class for the form user's can use to sign up for the site.
*/

import React, {Component} from "react";
import {Container, Row, Col, Form, Button} from "react-bootstrap";
import DatePicker from 'react-date-picker';
import {isMobile} from 'react-device-detect';
import {connect} from "react-redux";
import Axios from 'axios';

import {config} from "../config";
import {IsValidEmail, IsGoodPassword, GetGoodPasswordConfirmations, isValidName} from "../Utils";

import "../componentsStyle/SignUp.css";
import healthydrawing from "../icons/MedicalCare.svg";

//Error messages displayed to the user
const gErrorMessages = {
    "": "",
    "BLANK_FIELD": "Please fill in all fields.",
    "PASSWORD_MISMATCH": "Please make sure passwords match.",
    "INVALID_EMAIL": "Please enter a valid email address.",
    "INVALID_PASSWORD": "Please enter a valid password.",
    "NO_SERVER_CONNECTION": "Could not connect to server.",
    "ACCOUNT_EXISTS": "That email is already in use.\nPlease choose another.",
    "INVALID_NAME": "Please enter your first name and last name."
}

//TODO: Error handling for when there's no internet connection.


class Signup extends Component {
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
            birthday: "",
            successMessage: ""
        };
    }

    /*
        Redirects the user to the dashboard if they're already logged in.
    */
    componentDidMount() {
        if (this.props.auth.isAuth) {
            window.location.href = "/user";
        }
    }

    /*
        Processes the user's sign up submission. Redirects to the login page upon a successful submission.
        param e: The sign up submission event.
    */
    handleSignup = async (e) => {
        
        e.preventDefault(); //Prevents page reload on form submission
        
        if (this.isAnyFieldLeftBlank()) {
            this.setState({ errorMessage: "BLANK_FIELD" });
            return; //A field was left blank so don't finalize sign up
        }

        if (this.passwordMismatch()) {
            this.setState({ errorMessage: "PASSWORD_MISMATCH" });
            return; //User's password and confirm password field don't match
        }

        if (!IsValidEmail(this.state.email)) {
            this.setState({ errorMessage: "INVALID_EMAIL" });
            return; //User didn't enter a proper email
        }

        if (!IsGoodPassword(this.state.password)) {
            this.setState({ errorMessage: "INVALID_PASSWORD" })
            return; //User didn't enter proper passwords
        }

        if (!isValidName(this.state.name)){
            this.setState({ errorMessage: "INVALID_NAME"})
            return; //User didn't enter a proper name
        }
        //Try to sign up the user
        let response;

        try {
            response = await Axios.post(`${config.dev_server}/signup`, {
                name: this.state.name,
                email: this.state.email,
                password: this.state.password,
                birthday: this.state.birthday.toJSON().split("T")[0], //Don't include time data
            })
        }
        catch (response) { //No internet connection
            this.setState({errorMessage: "ACCOUNT_EXISTS"});
            return;
        }
        
        //Process response from server
        if (response.status === 200) { //Sign-up was a success
            this.setState({
                errorMessage: "", //Remove old errors
                successMessage: "Please check your email for a link to confirm your account."
            })

            if (isMobile) {
                //No navbar is on the mobile sign up page, so redirect the user automatically
                setTimeout(() => {
                    window.location.href = "/login"; //Redirect to login page after 5 seconds
                }, 5000);
            }
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
            || this.state.birthday === "";
    }

    /*
        Checks if the user's confirmed password doesn't match their password.
        returns: true if the user's input password and confirmed password don't match, false otherwise.
    */
    passwordMismatch() {
        return this.state.password !== this.state.confirmedPassword;
    }

    /*
        Gets the appropriate text to display to the user upon an error.
        returns: Error text if error exists.
    */
    getErrorText() {
        return gErrorMessages[this.state.errorMessage];
    }

    /*
        Print sign up page.
    */
    render() {
        var titleClass = "signup-form-title" + (isMobile ? " signup-form-title-mobile" : "");
        var inputErrorClass = "signup-error-input"; //Used to colour boxes with mistakes in pink
        var signUpError = this.getErrorText();
        var showPicture = !isMobile && window.innerWidth >= 1000;

        return (
            <div>
                {showPicture ? <img src={healthydrawing} className="signup-picture" alt="" /> : ""}

                <Container className={"p-3" + (!isMobile ? " mb-1 bg-white shadow rounded" : " mb-3")}
                    id={"signup-form-container" + (!showPicture ? "-mobile" : "")}
                >
                    {
                        //Display diffferent title after the sign-up was successful
                        this.state.successMessage !== "" ?
                            <h3 className={titleClass}>Account created!</h3>
                        :
                        <span>
                            <h3 className={titleClass}>Create Account,</h3>
                            <h5 className={titleClass}>
                                Join us to <span className="signup-form-join-message">show off your toenails!</span
                            ></h5>
                        </span>
                    }

                    <Row>
                        <Col>
                            {/* Error message if needed */}
                            <div className="signup-error">
                                <h6 className="error-text">{signUpError}</h6>
                            </div>

                            {
                            //Only show succress message after the sign up has been completed
                            this.state.successMessage !== "" ?
                                <div className="signup-success-message">
                                    {this.state.successMessage}
                                </div>
                            :
                            <Form className={"signup-form" + (!showPicture ? "-mobile" : "")} onSubmit={this.handleSignup.bind(this)}>

                                {/* Email Input */}
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="example@gmail.com"
                                        autoComplete="email"
                                        value={this.state.email}
                                        onChange={(e) => this.setState({ email: e.target.value.trim() })}
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
                                        onChange={(e) => { this.setState({ password: e.target.value }) }}
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
                                        value={this.state.confirmedPassword}
                                        onChange={(e) => this.setState({confirmedPassword: e.target.value})}
                                        className={(this.state.errorMessage === "BLANK_FIELD" && this.state.confirmedPassword === "")
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
                                        onChange={(e) => this.setState({ name: e.target.value })}
                                        className={(this.state.errorMessage === "BLANK_FIELD" && this.state.name === "") 
                                            || this.state.errorMessage === "INVALID_NAME" ? inputErrorClass : ""}
                                    />
                                </Form.Group>

                                {/* Age Input */}
                                <Form.Group controlId="formAge">
                                    <Form.Label>Birthday</Form.Label>
                                    <br></br>
                                    <DatePicker className={"form-control pointer "
                                        + ((this.state.errorMessage === "BLANK_FIELD" && this.state.birthday === "") ? inputErrorClass : "")}
                                        selected={this.state.birthday}
                                        value={this.state.birthday}
                                        onChange={(date) => this.setState({ birthday: date })}
                                        dateFormat="MMMM d, yyyy"
                                        maxDate={new Date()}
                                        calendarIcon={null}
                                        clearIcon={null} />
                                </Form.Group>

                                {/* Sign Up Button */}
                                <div className={isMobile ? "signup-form-buttons" : ""}>
                                    <Button className="signup-button" type="submit">
                                        Create Account
                                    </Button>

                                    {/* Sign Up link on mobile */}
                                    {
                                        isMobile ?
                                            <div className="signup-form-login-redirect">
                                                <span>
                                                    {"I have an account, "}
                                                    <Button onClick={() => window.location.href = "/login"}>
                                                        Login
                                                    </Button>
                                                </span>
                                            </div>
                                            : ""
                                    }
                                </div>
                            </Form>
                            }
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(Signup);
