import React, { Component } from 'react'
import forgotpasswordIcon from '../icons/forgotpassword.svg';
import "../componentsStyle/ForgotPassword.css";
import { Form, Button } from "react-bootstrap"
import Axios from 'axios';
import { config } from "../config";

export default class ForgotPassword extends Component {
    constructor(){
        super()
        this.state = {
            email: "",
            ValidUser: false,
            errorMessage: "",
            message: ""
        }
    }
    handleSubmit(e){
        e.preventDefault()
        Axios.post(`${config.dev_server}/forgotpassword`, {
            email: this.state.email
        })
        .then((res) => {
            console.log(res)
            if(res.data.msg === "An email has been sent to the email address."){
                this.setState({message: res.data.msg})
            }
            else if(res.data.msg === "Email address does not exist"){
                this.setState({errorMessage: "User does not exist"})
            }
        }, (err) => {
            this.setState({errorMessage: "Email address does not exist"})
        })
    }
    render() {
        return (
            <div className="shadow p-3 mb-5 bg-white rounded" id="forgotpasswordPage" style={{marginTop: "-2%"}}>
                <img className="forgotpasswordIcon" src={forgotpasswordIcon} alt="Forgot Password"/>
                <h3 className="forgotYourPasswordText">Forgot your password?</h3>
                <div id="forgotPasswordFormDiv">
                    <Form className="forgotpasswordForm">
                        <Form.Group controlId="formBasicEmail" className="forgotpasswordFormGroupText">
                            <h4 id="forgotpasswordErrorMessage">{this.state.errorMessage !== "" ? this.state.errorMessage : ""}</h4>
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" onChange={(e) => this.setState({email: e.target.value, errorMessage: ""})}/>
                        </Form.Group>
                        <Button variant="primary" type="submit" onClick={this.handleSubmit.bind(this)}>
                            Submit
                        </Button>
                    </Form>
                </div>
                <div className="forgotpasswordYouWillReceiveanEmail">
                    <h4>An email will be sent to the provided email address.</h4>
                    <h3>{this.state.message !== "" ? "Email has been successfully sent." : ""}</h3>
                </div>
            </div>
        )
    }
}
