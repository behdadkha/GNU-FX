import React, { Component } from 'react';
import Sidebar from "./Sidebar";
import { Button } from 'react-bootstrap';
import '../../componentsStyle/MyAccount.css'
//redux
import { connect } from "react-redux";
//Axios
import Axios from 'axios';
//config
import { config } from "../../config";
//icon
import padlock from '../../icons/padlock.png';



class MyAccount extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: ""
        };
    }

    async componentDidMount() {
        await Axios.get(`${config.dev_server}/user/getUserInfo`)
            .then((data) => {
                this.setState({
                    email: data.data
                });
            });
    }


    render() {
        return (
            <div style={{ overflow: "hidden" }}>
                <Sidebar {...this.props}></Sidebar>

                <div style={{ overflow: "hidden", textAlign: "left" }}>

                    <h5 style={{ padding: "1.5% 0 1% 4%", display: "inline" }}>Setting</h5>
                    <img src={padlock} alt="padlock" style={{ width: "50px", margin: "1% 0 1% 42.5%" }}></img>

                </div>

                <div style={{ overflow: "hidden", backgroundColor: "#8ef1f5", height: "100vh" }}>
                    <div id="accountDetails">

                        {/* name */}
                        <h6 style={{ textAlign: "left", paddingTop: "3%", fontSize: "20px", color: "#7471ad" }}>Account Details</h6>

                        <div style={{ textAlign: "left", paddingTop: "1%", }}>

                            <label style={{ display: "inline-block", fontSize: "20px", verticalAlign : "top" }}>Name</label>

                            <div className="accountDetailItem">
                                <h6 className="accountItemText">{this.props.auth.user.name}</h6>
                            </div>

                        </div>
                        <div style={{ textAlign: "left", paddingTop : "10px" }}>

                            <label style={{ display: "inline", fontSize: "20px", verticalAlign : "top"}}>Email</label>

                            <div className="accountDetailItem" style={{marginLeft : "2.5%"}}>
                                <h6 className="accountItemText" >{this.state.email}</h6>
                            </div>

                        </div>

                        <div style={{ textAlign: "center", position: "absolute", bottom: "5%", left: "45%" }}>

                            <Button style={{ fontSize: "25px" }}>Reset password</Button>

                        </div>

                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(MyAccount);
