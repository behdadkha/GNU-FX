import Axios from 'axios';
import React, { Component } from 'react'
import "../componentsStyle/ForgotPassword.css";
import "../componentsStyle/Signup.css";
import {config} from "../config"
export default class EmailVerificationReDirEmail extends Component {
    constructor(){
        super()
        this.state = {
            Message: ""
        }
    }
    componentDidMount() {
        var path = window.location.href;
        Axios.post(`${config.dev_server}/emailverification`, {
            url : path
        }).then((res) => {
            if(res.data.msg === ""){
                this.setState({Message: "Your account has been verified. Thank you"})
            }
            else{
                this.setState({Message: res.data.msg})
            }
        })
    }
    render() {
        return (
            <div className="shadow p-3 mb-5 bg-white rounded">
                <h4>{this.state.Message}</h4>
            </div>
        )
    }
}
