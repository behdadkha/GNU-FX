/*
    Class for the form user's can use to log in to the site.
*/

import React, { Component } from "react";
import { Col, Row, Container, Form, Button } from "react-bootstrap";

import jwt_decode from "jwt-decode";
import { config } from "../config";
import store from "../Redux/store";
import { SetCurrentUser } from "../Redux/Actions/authAction";
import { getAndSaveImages, getAndSaveToeData } from "../Redux/Actions/setFootAction";
import { SetAuthHeader, isValidInput, isValidEmail } from "../Utils";
import Axios from 'axios';

import loginImage from '../icons/Login.svg';
import "../componentsStyle/Login.css";
import { isMobile } from "react-device-detect";


export default class Login extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);
        this.state = {
            email: "", //The user's email input
            password: "", //The user's password input
            invalidUser: false, //Indicates whether or not an error message should be displayed
            errorMessage: ""
        };
    }

    /*
        Logs the user in and redirects to the dashboar if the login info is correct.
        param e: The login submission event.
    */
    handleLoginPatient = async (e) => {
        e.preventDefault(); //Prevents page reload on form submission
        //Try to log in user

        if (!isValidEmail(this.state.email)) {
            this.setState({ email: "", errorMessage: "Invalid Email Address" });
            return
        }
        if (!isValidInput(this.state.password)) {
            this.setState({ password: "", errorMessage: "Invalid Password" })
            return
        }

        let response
        try {
            response = await Axios.post(`${config.dev_server}/login`, {
                email: this.state.email,
                password: this.state.password
            })
        } catch (res) {
            this.setState({
                invalidUser: true
            });
            return
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
        } else {
            this.setState({
                invalidUser: true
            });
        }
    };

    /*
        Displays the login page.
    */
    render() {
        let loginError = (this.state.invalidUser) ? //Error displayed to the user if problem with login
            "Please enter valid credentials." : "";

        return (
            <div>
                <div className="LoginLogoPositon">
                    {isMobile? '' : <img src={loginImage} className="LoginLogo"  alt="login"/>}
                </div>
                <Container className="shadow p-3 mb-5 bg-white rounded" id={isMobile ? "LoginContainerMobile" : "LoginContainer"}>
                    <h3 id="LoginTitle">Login</h3>
                    {isMobile?  <img src={loginImage} className="LoginLogoMobile"  alt="login"/> : ''}
                    <Row>
                        <Col>
                            {/* Error message if needed */}
                            <div className="login-error">
                                <h6>
                                    {loginError}
                                </h6>
                                <h6>
                                    {this.state.errorMessage}
                                </h6>
                            </div>

                            {/* Actual login form */}
                            <Form
                                className="login-form"
                                onSubmit={this.handleLoginPatient.bind(this)}
                            >
                                {/* Email Input */}
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder=""
                                        value={this.state.email}
                                        onChange={(e) => {
                                            this.setState({ email: e.target.value.trim() })
                                        }
                                        }
                                    />
                                </Form.Group>

                                {/* Password Input */}
                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        value={this.state.password}
                                        onChange={(e) =>
                                            this.setState({ password: e.target.value.trim() })
                                        }
                                        type="password"
                                        placeholder=""
                                    />
                                </Form.Group>

                                {/* Login Button */}
                                <div style={{ textAlign: "center", marginTop: "10%" }}>
                                    <Button variant="primary" type="submit">
                                        Login
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
