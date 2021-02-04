/*
    A class for helping the user reset their password.
*/

import Axios from 'axios';
import React, {Component} from 'react'
import {Button, Form} from 'react-bootstrap';

import {config} from "../../config";
import padlock from '../../icons/padlock.png';

import '../../componentsStyle/ResetPassword.css';

export default class ResetPassword extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            currentPassword: "", //User's current password input
            newPassword1: "", //User's new password input
            newPassword2: "", //User's new password confirmed input
            incorrectPasswordError: false, //Helps with error message user enters an incorrect password
            passwordMismatchError: false, //Helps with error message when user enters password and confirm password that don't match
            emptyFieldError: false, //Helps with error message user leaves fields blank
            errorMsg: "" // To display error messages
        };
    }
    /*
        Checks if the user didn't fill out all fields on the form.
        returns: true if there is an empty field, false if all fields are filled in.
    */
    isAnyFieldLeftBlank() {
        return this.state.currentPassword === ""
            ||  this.state.newPassword1 === ""
            ||  this.state.newPassword2 === "";
    }

    /*
        Checks if the user's new confirmed password doesn't match the new password.
        returns: true if the user's input new password and confirmed password don't match, false otherwise.
    */
   passwordMismatch() {
        return this.state.newPassword1 !== this.state.newPassword2;
    }

    /*
        Processes the user's reset password submission. Redirects to the login page upon a successful submission.
        param e: The rest password submission event.
    */
    async handleSubmit(e) {
        e.preventDefault(); //Prevents page reload on form submission
        //Depending on the result of this function, different errors may be
        //set to be displayed to the user.
        if (/^\s/.test(this.state.newPassword1)){
            
            this.setState({errorMsg: "Password can't start with a space"})
        }
        else if (this.isAnyFieldLeftBlank())
        {
            //Some field was left empty
            this.setState({
                incorrectPasswordError: false,
                passwordMismatchError: false,
                emptyFieldError: true,
            });
        }
        else if (this.passwordMismatch()) {
            //User's new password and confirmed password don't match
            this.setState({
                incorrectPasswordError: false,
                passwordMismatchError: true,
                emptyFieldError: false,
            });
        }
        else {
        
            //Try to reset the password
            let data = await Axios.post(`${config.dev_server}/user/resetPassword`, {
                currentPassword: this.state.currentPassword,
                newPassword1: this.state.newPassword1,
                newPassword2: this.state.newPassword2
            }).catch(() => console.log("No response from server"));
            
            if(data.data.msg === "password changed") { //Successfully reset password
                this.props.history.push('/login');
            }
            else {
                //User's password was incorrect
                this.setState({
                    incorrectPasswordError: true,
                    passwordMismatchError: false,
                    emptyFieldError: false,
                });
            } 
            
        }
    }

    /*
        Gets the appropriate text to display to the user upon an error.
        returns: Error text if error exists.
    */
    getErrorText() {
        return (this.state.emptyFieldError) ? //User left a field blank
                <h6>Please fill in all fields.</h6>
            : (this.state.passwordMismatchError) ? //Passwords don't match
                <h6>Please make sure passwords match.</h6>
            : (this.state.incorrectPasswordError) ? //User's old password was incorrect
                <h6>Your password is incorrect.</h6>
            : "";
    }

    /*
        Prints the reset password page.
    */
    render() {
        var errorText = this.getErrorText();
        return (
            <div className="reset-password-container">
                <div className="reset-password-header"></div> {/* Grey header */ }

                <div className="shadow reset-password-box">
                    <img src={padlock} alt="padlock" className="padlock-img"></img>
                    <h6 className="reset-password-title">Reset Password</h6>

                    <div className="reset-password-error">
                        {errorText /* Error if needed */}
                    </div>

                    <div className="reset-password-form">
                        <Form test-id="resetPasswordFrom" onSubmit={this.handleSubmit.bind(this)}>
                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Current Password</Form.Label>
                                <Form.Control type="password"
                                              placeholder=""
                                              value={this.state.currentPassword} 
                                              onChange={(e) =>
                                                this.setState({currentPassword: e.target.value})
                                              }
                                              className = {(this.state.emptyFieldError && this.state.currentPassword === "") 
                                                || this.state.incorrectPasswordError ? "signup-error-input" : ""}
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword" className="reset-password-form-input-spacing">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control type="password"
                                              placeholder=""
                                              value={this.state.newPassword1}
                                              onChange={(e) =>
                                                this.setState({newPassword1: e.target.value})
                                              }
                                              className = {(this.state.emptyFieldError && this.state.newPassword1 === "") 
                                                || this.state.passwordMismatchError ? "signup-error-input" : ""}
                                />
                            </Form.Group>
    
                            <Form.Group controlId="formBasicPassword" className="reset-password-form-input-spacing">
                                <Form.Label>Confirm New Password</Form.Label>
                                <Form.Control type="password"
                                              placeholder=""
                                              value={this.state.newPassword2}
                                              onChange={(e) =>
                                                this.setState({newPassword2: e.target.value})
                                              }
                                              className = {(this.state.emptyFieldError && this.state.newPassword2 === "") 
                                                || this.state.passwordMismatchError ? "signup-error-input" : ""}
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Form>
                        <h6>{this.state.errorMsg}</h6>
                    </div>
                </div>
            </div>
        )
    }
}
