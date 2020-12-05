import Axios from 'axios';
import React, { Component } from 'react'
import { Button, Form } from 'react-bootstrap';
//config
import { config } from "../../config";
//icon
import padlock from '../../icons/padlock.png';

export default class ResetPassword extends Component {

    constructor(props) {
        super(props);

        this.state = {
            currentPassword: "",
            newPassword1: "",
            newPassword2: "",
            errorText : ""
        };
    }

    handleSubmit(e) {
        e.preventDefault();

        if(this.state.newPassword1 === this.state.newPassword2){
            Axios.post(`${config.dev_server}/user/resetPassword`, {
                currentPassword : this.state.currentPassword,
                newPassword1 : this.state.newPassword1,
                newPassword2 : this.state.newPassword2
            })
            .then((data) => {
                //successfully reseted password
                console.log(data.data.msg);
                if(data.data.msg === "password changed"){
                    this.props.history.push('/login');
                }else{
                    this.setState({
                        errorText : "Something is not quite right, try again."
                    });
                } 
            });
        }else{
            this.setState({
                errorText : "Passwords do not match."
            });
        }
    }

    render() {
        return (
            <div style={{ position: "relative" }}>
                <div style={{ height: "20vh", backgroundColor: "#7bedeb" }}></div>
                <div className="shadow"
                    style={{
                        backgroundColor: "white",
                        width: "500px",
                        height: "600px",
                        overflow: "hidden",
                        position: "absolute",
                        top: "40%",
                        left: "37%",
                        zIndex: "1",
                        borderRadius: "5px"
                    }}>
                    <img src={padlock} alt="padlock" style={{ width: "60px", paddingTop: "8%" }}></img>
                    <h6 style={{ paddingTop: "2%" }}>Reset Password</h6>
                    {this.state.errorText !== "" ? <h6>{this.state.errorText}</h6> : ""}
                    <div style={{ width: "300px", justifyContent: "center", margin: "auto", textAlign: "left", paddingTop: "10%" }}>

                        <Form>

                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Current Password</Form.Label>
                                <Form.Control type="password" placeholder="Current Password" value={ this.state.currentPassword } onChange={(e) => this.setState({ currentPassword: e.target.value })}/>
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword" style={{ paddingTop: "6%" }}>
                                <Form.Label>New Password</Form.Label>
                                <Form.Control type="password" placeholder="New Password" value={ this.state.newPassword1 } onChange={(e) => this.setState({ newPassword1: e.target.value })} />
                            </Form.Group>
                            <Form.Group controlId="formBasicPassword">
                                <Form.Control type="password" placeholder="New Password" value={ this.state.newPassword2 } onChange={(e) => this.setState({ newPassword2: e.target.value })} />
                            </Form.Group>

                            <Button variant="primary" type="submit" onClick={this.handleSubmit.bind(this)}>
                                Submit
                            </Button>

                        </Form>
                    </div>

                </div>
            </div>
        )
    }
}
