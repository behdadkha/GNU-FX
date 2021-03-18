import Axios from 'axios';
import React, { Component } from 'react'
import {Form, Button} from 'react-bootstrap'
import "../componentsStyle/ForgotPassword.css";
import "../componentsStyle/SignUp.css";
import {config} from "../config"
export default class EmailVerificationReDirEmail extends Component {
    constructor(){
        super()
        this.state = {
            email: "",
            emailFromUrl: "",
            Message: ""
        }
    }
    componentDidMount() {
        var path = window.location.pathname;
        path = path.split("/emailverification/")[1];
        this.setState({emailFromUrl: path.trim()});
    }
    handleSubmit = async (e) => {
        e.preventDefault()

        let response;
        try{
            response = await Axios.post(`${config.dev_server}/emailverification`, {
                email: this.state.email,
                emailFromUrl: this.state.emailFromUrl
            })
            this.setState({Message: response.data.msg})
        }
        catch(response){
            console.log(response);
            this.setState({Message: "UNKNOWN_ERROR"})
            return;
        }
        if(this.state.Message === ""){
            this.setState({
                Message: response.data.msg === "" ? "The email has been verified successfully. You will be returned to the login page shortly." :  response.data.msg,
            });
            setTimeout(function () {
                window.location.href = "/login"; //Redirect to login page after 4 seconds
            }, 4000)
        }
        
    }
    render() {
        return (
            <div className="shadow p-3 mb-5 bg-white rounded">
                <Form className="signup-form">
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" onChange={(e) => this.setState({email: e.target.value})}/>
                    </Form.Group>
                    <Button variant="primary" type="submit" onClick={this.handleSubmit.bind(this)}>
                        Verify
                    </Button>
                </Form>
                <h4>{this.state.Message}</h4>
            </div>
        )
    }
}
