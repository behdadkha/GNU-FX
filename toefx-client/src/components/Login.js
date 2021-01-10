/*
    Class for the login page.
*/

import React, {Component} from "react";
import {Col, Row, Container, Form, Button} from "react-bootstrap";
import store from "../Redux/store";
import {setCurrentUser} from "../Redux/Actions/authAction";
import {getAndSaveImages} from "../Redux/Actions/setFootAction";
import jwt_decode from "jwt-decode";
import setAuthHeader from "../utils/setAuthHeader";
import { config } from "../config";
import "../componentsStyle/Login.css";


export default class Login extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            user: null,
            invalidUser: false
        };
    }

    /*
        Logs the user in if the login info is correct.
    */
    handleLoginPatient = async (e) => {
        e.preventDefault();

        const response = await fetch(`${config.dev_server}/login`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: this.state.email,
                password: this.state.password,
            }),
        });

        if (response.status === 200) { //The login was a success
            let body = await response.json();
            this.setState({
                user: body,
            });
            
            const {token} = body; //Extract the token from the response
            localStorage.setItem("jwt", token); //Save the token in localstorage
            setAuthHeader(token); //Set the token to header for feature requests
            store.dispatch(setCurrentUser(jwt_decode(token))); //Add the user data(decoded) to the store 
            
            //getting all the user's images
            store.dispatch(getAndSaveImages());
            
            //Redirect to User page
            this.props.history.push('/user');
            //By reloading the page, the true path becomes /user
            window.location.reload();
        }
        else { //The login was a failure
            this.setState({
                invalidUser: true,
            });
        }
    };

    /*
        Displays the login page.
    */
    render() {
        let loginError = (this.state.invalidUser) ? //Error displayed to the user if problem with login
            <div>
                <h6 className="login-error">Please enter valid credentials.</h6>
            </div>
        : 
            ""

        return (
            <Container>
                <Row>
                    <Col>
                        <div className="login-error">
                            {loginError /* Error message if needed */}
                        </div>
                        <Form
                            className="login-form"
                            onSubmit={this.handleLoginPatient.bind(this)}
                        >
                            {/* Email Input */}
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Email"
                                    value={this.state.email}
                                    onChange={(e) =>
                                        this.setState({email: e.target.value})
                                    }
                                />
                            </Form.Group>

                            {/* Password Input */}
                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    value={this.state.password}
                                    onChange={(e) =>
                                        this.setState({
                                            password: e.target.value,
                                        })
                                    }
                                    type="password"
                                    placeholder="Password"
                                />
                            </Form.Group>

                            {/* Login Button */}
                            <Button variant="primary" type="submit">
                                Login
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }
}
