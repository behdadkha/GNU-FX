import Axios from 'axios'
import React, { Component } from 'react'
import { Form, Button } from 'react-bootstrap'
import { config } from "../config";
import "../componentsStyle/ForgotPasswordReDirEmail.css"
import CheckMark from "../icons/checkmark.png";
import CrossMark from "../icons/crossmark.png"
export default class ForgotPasswordReDirEmail extends Component {
    constructor() {
        super()
        this.state = {
            emailFromUrl: "",
            email: "",
            password: "",
            confirmPassword: "",
            message: "",
            IsPasswordLengthStrong: false, //Helps with showing the check mark for 'Password must be at least 8 characters long'
            DoesPasswordHaveUpperandLowerCase: false, //Helps with showing the check mark for 'Password must contain uppercase(A-Z) and lowercase(a-z) characters'
            DoesPasswordHaveNumber: false, //Helps with showing the check mark for 'Password must contain a number'
        }
    }
    componentDidMount() {
        var path = window.location.pathname
        path = path.replace('/forgotpassword/', '')
        this.setState({ emailFromUrl: path })
    }
    handlePasswordChange(e) {
        e.preventDefault()
        if (this.state.IsPasswordLengthStrong && this.state.DoesPasswordHaveUpperandLowerCase && this.state.DoesPasswordHaveNumber && (this.state.password === this.state.confirmPassword)) {
            Axios.post(`${config.dev_server}/forgotpassword/checkEmails`, {
                emailFromURL: this.state.emailFromUrl,
                emailInput: this.state.email,
                password: this.state.password,
                confirmPassword: this.state.confirmPassword
            })
                .then((res) => {
                    this.setState({ message: res.data.msg })
                })
        }
        else{
            this.setState({message: "Password is not strong enough or passwords do not match"})
        }

    }
    PasswordChecker(e) {
        //checks password length
        if (e.target.value.length >= 8) {
            this.setState({ IsPasswordLengthStrong: true })
        }
        else {
            this.setState({ IsPasswordLengthStrong: false })
        }
        //Password contains one uppercase and one lowercase char
        if (e.target.value.match(/[a-z]+/) && e.target.value.match(/[A-Z]+/)) {
            this.setState({ DoesPasswordHaveUpperandLowerCase: true })
        }
        else {
            this.setState({ DoesPasswordHaveUpperandLowerCase: false })
        }
        //Password contains a number
        if (e.target.value.match(/[0-9]+/)) {
            this.setState({ DoesPasswordHaveNumber: true })
        }
        else {
            this.setState({ DoesPasswordHaveNumber: false })
        }
    }
    render() {
        return (
            <div className="shadow bg-white rounded FPFormDiv">
                <h3>Reset Password</h3>
                <Form className="FPform shadow p-3 mb-5 bg-white rounded">
                    <Form.Group controlId="formBasicEmail" className="FPtextAlign">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" onChange={(e) => this.setState({ email: e.target.value })} />
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword" className="FPtextAlign">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" onChange={(e) => { this.setState({ password: e.target.value }); this.PasswordChecker(e) }} />
                        <Form.Label id="StrongPassword"><Form.Text className="text-muted">{this.state.IsPasswordLengthStrong ? <img src={CheckMark} id="FPPasswordCheckMark" alt="checkmark" /> : <img src={CrossMark} id="FPPasswordCheckMark" alt="crosskmark" />}Password must be at least 8 characters long</Form.Text></Form.Label>
                        <br></br>
                        <Form.Label id="StrongPassword"><Form.Text className="text-muted">{this.state.DoesPasswordHaveUpperandLowerCase ? <img src={CheckMark} id="FPPasswordCheckMark" alt="checkmark" /> : <img src={CrossMark} id="FPPasswordCheckMark" alt="crosskmark" />}Password must contain uppercase(A-Z) and lowercase(a-z) characters</Form.Text></Form.Label>
                        <br></br>
                        <Form.Label ><Form.Text className="text-muted">{this.state.DoesPasswordHaveNumber ? <img src={CheckMark} id="FPPasswordCheckMark" alt="checkmark" /> : <img src={CrossMark} id="FPPasswordCheckMark2" alt="crosskmark" />}Password must contain a number</Form.Text></Form.Label>
                    </Form.Group>
                    <Form.Group controlId="formBasicPassword" className="FPtextAlign">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" onChange={(e) => this.setState({ confirmPassword: e.target.value })} />
                    </Form.Group>
                    <Button variant="primary" type="submit" onClick={this.handlePasswordChange.bind(this)}>
                        Submit
                    </Button>
                </Form>
                <h4 className="FPmessage">{this.state.message !== "" ? this.state.message : ""}</h4>
                {this.state.message === "Password Changed. Redirecting to Login page..." ? setTimeout(function () { window.location.href = "/login" }, 4000) : ""}
            </div>
        )
    }
}
