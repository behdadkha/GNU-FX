import React, {Component} from "react";
import {Col, Row, Container, Form, FormControl, Button} from "react-bootstrap";
import "../componentsStyle/Login.css";

export default class Signup extends Component {
    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        <Form className="form">
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                />
                                <Form.Text className="text-muted">
                                    We'll never share it with anyone else.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                />
                            </Form.Group>
                            <Form.Group controlId="formName">
                                <Form.Label>Full Name:</Form.Label>
                                <Form.Control type="text" placeholder="name" />
                            </Form.Group>
                            <Form.Group controlId="formAge">
                                <Form.Label>Age:</Form.Label>
                                <Form.Control type="number" placeholder="age" />
                            </Form.Group>

                            <Button variant="primary" type="submit">
                                Create account
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }
}
