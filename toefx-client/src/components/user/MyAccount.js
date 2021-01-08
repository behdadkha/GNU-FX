/*
    Class for displaying the user's account details.
*/

import React, {Component} from 'react';
import {Button, Table} from 'react-bootstrap';
import {connect} from "react-redux";
import {config} from "../../config";
import Sidebar from "./Sidebar";
import Axios from 'axios';
import '../../componentsStyle/MyAccount.css'
import store from '../../Redux/store';
import { getAndSaveImages } from '../../Redux/Actions/setFootAction';


class MyAccount extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            imageUrls: [],
            toeData: [],
            showLeftFoot: true
        };
    }

    /*
        Logs the user out if they're not logged in.
        Otherwise loads the user's data from the server.
    */
    async componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            this.props.history.push("/login");

        
        //redux data gets erased after a refresh so if the data is gone we need to get them again
        if (this.props.foot.images.length === 0){
            await store.dispatch(getAndSaveImages());
            this.setState({
                imageUrls : this.props.foot.images
            });

        }else{
            this.setState({
                imageUrls : this.props.foot.images
            });
        }


        //get the user's toe data from the node server
        await Axios.get(`${config.dev_server}/getToe`)
            .then((data) => {
                this.setState({
                    toeData: data.data
                })
            });
        
    }

    /*
        Redirects the user to a page where they can reset their password.
    */
    navigateToResetPasswordPage() {
        this.props.history.push('/user/resetPassword')
    }

    /*
        Changes the value of showLeftFoot
        showLeftFoot: bool 
    */
    viewFoot(showLeftFoot) {

        this.setState({
            showLeftFoot: showLeftFoot,
        });
 
    }

    /*
        Prints one of the user's uploaded images in the list.
    */
    printUploadedImage(id, toe, selectedFootIndex) {
        var toesName = ["Big Toe", "Index Toe", "Middle Toe", "Fourth Toe", "Little Toe"];
        var foot = ["Left", "Right"]
        return (
            toe.images.map(({name, date}, index) => 
                <tr key={id + ' ' + index}>
                    <td><img src={this.state.imageUrls.find(({imageName}) => imageName === name).url} alt="img" className="toeImages"/></td>
                    <td>{foot[selectedFootIndex]}</td>
                    <td>{toesName[id]}</td>
                    <td>{date.split("T")[0]}</td>
                </tr>
            )
        )
    }

    /*
        Displays the account page.
    */
    render() {

        var defaultFootButtonClass = "graph-foot-button";
        var activeFootButtonClass = defaultFootButtonClass + " active-toe-button";

        //0 -> left foot, 1 -> right foot
        var selectedFootIndex =  (this.state.showLeftFoot) ? 0 : 1;

        return (
            <div style={{ overflow: "hidden" }}>
                <Sidebar {...this.props}/>
                <div className="welcome-bar">
                    <h6 className="welcome">My Account</h6>
                </div>

                {/* Main part */}
                <div className="my-account-main-container">
                    
                    {/* Account Details Bubble */}
                    <div className="account-details">
                        <h6 className="account-details-title">Account Details</h6>
                        <h6 className="account-details-name">{this.props.auth.user.name}</h6>
                        <h6 className="account-details-name" >{this.state.email}</h6>

                        <Button className="reset-password-button" onClick={this.navigateToResetPasswordPage.bind(this)}>Reset Password</Button>
                    </div>

                    {/* Image Table Bubble */}
                    <div className="images-table">
                        <div className="graph-feet-buttons">
                            <button onClick={this.viewFoot.bind(this, true)}
                                        className={(this.state.showLeftFoot ? activeFootButtonClass : defaultFootButtonClass)}>
                                    Left Foot
                            </button>

                            <button onClick={this.viewFoot.bind(this, false)}
                                        className={(!this.state.showLeftFoot ? activeFootButtonClass : defaultFootButtonClass)}>
                                    Right Foot
                            </button>
                        </div>
                        <Table striped bordered size="md" className="uploaded-image-table">
                            <thead>
                                <tr>
                                    <th style={{width : "20%"}}>Image</th>
                                    <th>Foot</th>
                                    <th>Toe</th>
                                    <th>Upload Date</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                (this.state.toeData.feet) ? this.state.toeData.feet[selectedFootIndex].toes.map((toe,id) => this.printUploadedImage(id, toe, selectedFootIndex)) : <tr></tr>
                            }
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    foot: state.foot
});

export default connect(mapStateToProps)(MyAccount);
