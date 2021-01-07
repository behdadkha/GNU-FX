import React, {Component} from "react";
import {Col, Row, Container, Form, Button} from "react-bootstrap";
import "../componentsStyle/Login.css";


export default class Signup extends Component {

    constructor(props){
        super(props);
        this.state = {
            name : "",
            email : "",
            password: "",
            age: 0,
            accountExists : false
        };
    }

    handleSignup = async (e)=>{
        e.preventDefault();
        const response = await fetch("http://localhost:3001/signup", {
            method : "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type' : 'application/json'
            },
            body:JSON.stringify({ "name" : this.state.name, "email" : this.state.email, "password" : this.state.password, "age": this.state.age})
        });

        if(response.status === 200){
            await response.json();

            //redirect to User page
            this.props.history.push('/user');

        }else if(response.status === 400){
            this.setState({
                accountExists : true
            });
        }
        
        window.location.reload();
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        {this.state.accountExists && <h6>Account already exists</h6>}
                    </Col>
                </Row>
                <Row>
                    <Col>
                            <Form className="form">
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control type="email" placeholder="Enter email" value={this.state.email} onChange={(e) => this.setState({email : e.target.value})}/>
                                    <Form.Text className="text-muted">
                                        We'll never share your email with anyone else.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder="Password" value={this.state.password} onChange={(e) => this.setState({password : e.target.value})} />
                                </Form.Group>

                                <Form.Group controlId="formBasicConfirmPassword">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control type="password" placeholder="Password" />
                                </Form.Group>

                                <Form.Group controlId="formName">
                                    <Form.Label>Full Name:</Form.Label>
                                    <Form.Control type="text" placeholder="Name" value={this.state.name} onChange={(e) => this.setState({name : e.target.value})} />
                                </Form.Group>
                                <Form.Group controlId="formAge">
                                    <Form.Label>Age:</Form.Label>
                                    <Form.Control type="number" placeholder="age" value={this.state.age} onChange={(e) => this.setState({age : e.target.value})}/>
                                </Form.Group>

                                <Button variant="primary" type="submit" onClick={this.handleSignup.bind(this)}>
                                    Create account
                                </Button>
                            </Form>
                    </Col>
                </Row>
            </Container>
        );
    }
}
