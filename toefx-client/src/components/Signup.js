/*
    Class for the form user's can use to sign up for the site.
*/

import React, {Component} from "react";
import {Col, Row, Container, Form, Button} from "react-bootstrap";

import "../componentsStyle/Signup.css";


export default class Signup extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);
        this.state = {
            name : "", //User's name input
            email : "", //User's email input
            password: "", //User's password input
            confirmedPassword: "", //User's confirmed password input
            age: "", //User's age input
            accountExistsError: false, //Helps with error message if account with email already exists
            passwordMismatchError: false, //Helps with error message when user enters password and confirm password that don't match
            emptyFieldError: false, //Helps with error message user leaves fields blank
        };
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
        Processes the user's sign up submission. Redirects to the login page upon a successful submission.
        param e: The sign up submission event.
    */
    handleSignup = async (e)=> {
        e.preventDefault(); //Prevents page reload on form submission

        if (this.isAnyFieldLeftBlank())
        {
            this.setState({emptyFieldError: true, accountExistsError: false, passwordMismatchError: false});
            return; //A field was left blank so don't finalize sign up
        }

        if (this.passwordMismatch())
        {
            this.setState({emptyFieldError: false, accountExistsError: false, passwordMismatchError: true});
            return; //User's password and confirm password field don't match
        }

        //Try to sign up the user
        const response = await fetch("http://localhost:3001/signup", {
            method : "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type' : 'application/json'
            },
            body:JSON.stringify({
                "name": this.state.name,
                "email": this.state.email,
                "password": this.state.password,
                "age": this.state.age
            })
        });

        //Process response from server
        if (response.status === 200) { //Sign-up was a success
            await response.json();

            //Redirect to User page
            this.props.history.push('/login');

        }
        else if(response.status === 400) { //Account already exists
            this.setState({emptyFieldError: false, accountExistsError: true, passwordMismatchError: false});
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
            : (this.state.accountExistsError) ? //Entered email is already in use
                <h6>That email is already in use. Please choose another.</h6>
            : "";
    }

    /*
        Print sign up page.
    */
    render() {
        let signUpError = this.getErrorText();

        return (
            <Container>
                <Row>
                    <Col>
                        {/* Error message if needed */}
                        <div className="signup-error">
                            {signUpError}
                        </div>

                        <Form className="signup-form" onSubmit={this.handleSignup.bind(this)}>

                            {/* Email Input */}
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="example@gmail.com"
                                    value={this.state.email}
                                    onChange={(e) =>
                                        this.setState({email: e.target.value})
                                    }
                                    className = {(this.state.emptyFieldError && this.state.email === "") 
                                                || this.state.accountExistsError ? "signup-error-input" : ""}
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
                                    placeholder="12345678"
                                    value={this.state.password}
                                    onChange={(e) =>
                                        this.setState({password: e.target.value})
                                    }
                                    className = {(this.state.emptyFieldError && this.state.password === "")
                                                || this.state.passwordMismatchError ? "signup-error-input" : ""}
                                />
                            </Form.Group>

                            {/* Confirm Password Input */}
                            <Form.Group controlId="formBasicConfirmPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="12345678"
                                    value={this.state.confirmedPassword}
                                    onChange={(e) =>
                                        this.setState({confirmedPassword: e.target.value})
                                    }
                                    className = {(this.state.emptyFieldError && this.state.confirmedPassword === "")
                                                || this.state.passwordMismatchError ? "signup-error-input" : ""}
                                />
                            </Form.Group>

                            {/* Full Name Input */}
                            <Form.Group controlId="formName">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Bob Smith"
                                    value={this.state.name}
                                    onChange={(e) =>
                                        this.setState({name: e.target.value})
                                    }
                                    className = {(this.state.emptyFieldError && this.state.name === "") ? "signup-error-input" : ""}
                                />
                            </Form.Group>
                        
                            {/* Age Input */}
                            <Form.Group controlId="formAge">
                                <Form.Label>Age</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="50"
                                    value={this.state.age}
                                    onChange={(e) =>
                                        this.setState({age: e.target.value})
                                    }
                                    className = {(this.state.emptyFieldError && this.state.age === "") ? "signup-error-input" : ""}
                            />
                            </Form.Group>

                            {/* Sign Up Button */}
                            <Button variant="primary" type="submit">
                                Create Account
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }
}
