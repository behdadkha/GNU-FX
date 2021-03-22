/*
    A class displayed after a user's account is successfully verified.
*/

import React, {Component} from 'react'
import {isMobile} from 'react-device-detect';
import {Container, Button} from "react-bootstrap";
import Axios from 'axios';

import {config} from "../config"

import "../componentsStyle/SignUp.css"; //Reuse CSS from sign up form


export default class EmailVerificationReDirEmail extends Component {
    /*
        Sets the base data for the page.
    */
    constructor() {
        super()

        this.state = {
            title: "", //The title on the page displayed to the user
            message: "", //The message the user recieves about the outcome of the verification
            showLoginButton: false, //Displayed if the verification was successful
        }
    }

    /*
        Validates the user when the page is visited.
    */
    componentDidMount() {
        var path = window.location.href; //The encrypted link is used to verify the user

        Axios.post(`${config.dev_server}/emailverification`, {
            url : path
        }).then((res) => {
            var title = "Verification Error"; //Invalid unless specified otherwise
            var message = res.data.errorMsg;
            var showLoginButton = true; //Only true when verification is successful

            if (message === "")
            {
                title = "Account Verified";
                message ="Please continue from the login page.";
                showLoginButton = true;
            }

            this.setState({
                title: title,
                message: message,
                showLoginButton: showLoginButton,
            });
        })
    }

    /*
        Prints the page.
    */
    render() {
        var titleClass = "signup-form-title" + (isMobile ? " signup-form-title-mobile" : "");

        return (
            <Container className={isMobile ? "mt-5" : "shadow p-3 mb-5 bg-white rounded"}>
                <h3 className={titleClass}>{this.state.title}</h3>
                <h5 className={isMobile? "signup-form-title-mobile" : ""}>{this.state.message}</h5>

                {   //Show login button for quick access
                    this.state.showLoginButton &&
                        <Button className="mt-4" onClick={() => window.location.href = "/login"}>
                            Login
                        </Button>
                }
            </Container>
        )
    }
}
