import React, {Component} from "react";
import {Col, Row, Container, Form, Button} from "react-bootstrap";
import "../componentsStyle/Login.css";
import store from "../Redux/store";
import {setCurrentUser} from "../Redux/Actions/authAction";
import jwt_decode from "jwt-decode";
import setAuthHeader from "../utils/setAuthHeader";
import { config } from "../config";

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            user: null,
            invalidUser: false
        };
    }

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

        if (response.status === 200) {
            let body = await response.json();
            this.setState({
                user: body,
            });

            
            const {token} = body; //extract the token from the response
            localStorage.setItem("jwt", token); //save the token in localstorage
            setAuthHeader(token); //set the token to header for feature requests
            store.dispatch(setCurrentUser(jwt_decode(token))); //add the user data(decoded) to the store 

            //redirect to User page
            this.props.history.push('/user');

        }else{
            this.setState({
                invalidUser: true,
            });
        }
    };

    render() {
        let IfInvalid;
        if (this.state.invalidUser) {
            IfInvalid = (
                <div>
                    <h6>Please enter valid credentials.</h6>
                </div>
            );
        }
        else {
            IfInvalid = (
                <div>
                    <h6></h6>
                </div>
            );  
        }

        return (
            <Container>
                <Row>
                    <Col>
                        {IfInvalid}
                        <Form
                            className="form"
                            onSubmit={this.handleLoginPatient.bind(this)}
                        >
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
                            <Button variant="primary" type="submit">
                                Login
                            </Button>
                            <h6 id="IamAClinicianTEXT" onClick={() => this.props.history.push("loginClinician")}>I am a clinician</h6>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }
}
