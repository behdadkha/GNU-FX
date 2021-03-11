/*
    Class for the form user's can use to log in to the site.
*/

import React, {Component} from "react";
import {Col, Row, Container, Form, Button} from "react-bootstrap";
import {isMobile} from "react-device-detect";
import {connect} from "react-redux";
import Axios from 'axios';

import jwt_decode from "jwt-decode";
import {config} from "../config";
import store from "../Redux/store";
import {SetCurrentUser} from "../Redux/Actions/authAction";
import {getAndSaveImages, getAndSaveToeData} from "../Redux/Actions/setFootAction";
import {SetAuthHeader, IsValidInput, IsValidEmail} from "../Utils";

import loginImage from '../icons/Login.svg';
import "../componentsStyle/Login.css";

//Error messages displayed to the user
const gErrorMessages = {
    "": "",
    "INVALID_EMAIL": "Invalid email address.",
    "INVALID_PASSWORD": "Invalid password.", 
    "NO_SERVER_CONNECTION": "Couldn't connect to server.",
    "INVALID_CREDENTIALS": "Incorrect email or password.",
}


class Login extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            email: "", //The user's email input
            password: "", //The user's password input
            errorMessage: "" //The error to be displayed to the user (if any)
        };
    }

    /*
        Redirects the user to the dashboard if they're already logged in.
    */
    componentDidMount() {
        if (this.props.auth.isAuth)
        {
            this.props.history.push("/user");
            window.location.reload(); //Helps fix navbar
        }
    }

    /*
        Logs the user in and redirects to the dashboar if the login info is correct.
        param e: The login submission event.
    */
    handleLoginPatient = async (e) => {
        e.preventDefault(); //Prevents page reload on form submission

        //Check if any field hasn't been filled in
        if (this.isAnyFieldLeftBlank()) {
            this.setState({errorMessage: "INVALID_CREDENTIALS"});
            return; //Don't log in
        }

        //Check if user entered bad email
        if (!IsValidEmail(this.state.email)) {
            this.setState({
                email: "",
                errorMessage: "INVALID_EMAIL",
            });

            return; //Don't log in
        }

        //Check if user entered bad password
        if (!IsValidInput(this.state.password)) {
            this.setState({
                password: "",
                errorMessage: "INVALID_PASSWORD",
            });

            return; //Don't log in
        }

        //User input passed basic checks so submit data to server
        let response;

        try {
            response = await Axios.post(`${config.dev_server}/login`, {
                email: this.state.email,
                password: this.state.password
            })
        }
        catch (res) {
            this.setState({
                errorMessage: "INVALID_CREDENTIALS",
            });

            return;
        }

        //Process response from server
        if (response.status === 200 && response.data) { //The login was a success
            let body = response.data;

            const { token } = body; //Extract the token from the response
            localStorage.setItem("jwt", token); //Save the token in localstorage

            SetAuthHeader(token); //Set the token to header for feature requests

            store.dispatch(SetCurrentUser(jwt_decode(token)));//Add the user data(decoded) to the store 

            //Load all of the user's images from the server
            store.dispatch(getAndSaveImages());

            //Load all of the user's toe data from the server like fungal coverage
            store.dispatch(getAndSaveToeData());

            //Redirect to User page
            this.props.history.push('/user');

            //By reloading the page, the true path becomes /user and the header bar disappears
            window.location.reload();
        }
        else {
            this.setState({
                errorMessage: "INVALID_CREDENTIALS",
            });
        }
    };

    /*
        Checks if the user didn't fill out all fields on the form.
        returns: true if there is an empty field, false if all fields are filled in.
    */
    isAnyFieldLeftBlank() {
        return this.state.email === ""
            || this.state.password === "";
    }

    /*
        Gets the appropriate text to display to the user upon an error.
        returns: Error text if error exists.
    */
    getErrorText() {
        return gErrorMessages[this.state.errorMessage];
    }

    /*
        Displays the login page.
    */
    render() {
        var titleClass = "login-form-title" + (isMobile ? " login-form-title-mobile" : "");
        var containerClass = "p-3 mb-5" + (!isMobile ? " bg-white shadow rounded" : "");

        return (
            <div>
                <div className="login-logo-container">
                    {isMobile? '' : <img src={loginImage} className="login-logo"  alt=""/>} {/*Remove image on mobile*/}
                </div>
    
                <Container className={containerClass} id={"login-container" + (isMobile ? "-mobile" : "")}>
                    <h3 className={titleClass}>Welcome,</h3>
                    <h4 className={titleClass}>Sign in to ToeFX!</h4>
                    <Row>
                        <Col>
                            {/* Error message if needed */}
                            <div className="login-form-error">
                                <h6 className="error-text">{this.getErrorText()}</h6>
                            </div>

                            {/* Actual login form */}
                            <Form
                                className="login-form"
                                onSubmit={this.handleLoginPatient.bind(this)}
                            >
                                {/* Email Input */}
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder=""
                                        autoComplete="email"
                                        value={this.state.email}
                                        onChange={(e) => this.setState({email: e.target.value.trim()})}
                                    />
                                </Form.Group>

                                {/* Password Input */}
                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder=""
                                        autoComplete="current-password"
                                        value={this.state.password}
                                        onChange={(e) => this.setState({password: e.target.value})}
                                    />
                                </Form.Group>
                    
                                <div className="mt-3 text-right">
                                    <a className="forgot-password-button" href="/forgotpassword">Forgot Password?</a>
                                </div>

                                {/* Login Button */}
                                <div className = "login-form-buttons">
                                    <Button className="login-button" type="submit">
                                        Login
                                    </Button>

                                    {/* Sign Up link on mobile */}
                                    {
                                        isMobile ?
                                            <div className = "login-form-signup-redirect">
                                                <span>
                                                    {"I'm a new user, "}
                                                    <Button onClick={() => this.props.history.push("/signup")}>
                                                        Sign Up
                                                    </Button>
                                                </span>
                                            </div>
                                        : ""
                                    }
                                </div>
                            </Form>
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

export default connect(mapStateToProps)(Login);
