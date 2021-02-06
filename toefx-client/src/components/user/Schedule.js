/*
    A class for displaying the user's treatment schedule.
*/

import React, {Component} from 'react';
import {Table} from 'react-bootstrap';
import {connect} from "react-redux";
import Axios from "axios";

import Sidebar from './Sidebar';

import "bootstrap/dist/css/bootstrap.min.css";
import '../../componentsStyle/Schedule.css';

class Schedule extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props){
        super(props);

        this.state = {
            scheduleData: [] //Contains user's schedule data such as date, comment, docker's name
        }
    }

    /*
        Logs the user out if they're not logged in.
        Otherwise loads the user's data from the server.
    */
    async componentDidMount() {
        //Redirect to login page if user not logged in
        
        if (!this.props.auth.isAuth){
            this.props.history.push("/Login");
            return;
        }
        try{
        //Gets user's schedule from the server
        let response = await Axios.get("http://localhost:3001/user/getschedule")
        
        this.setState({
            scheduleData: response.data
        })

        }catch{
            console.log("couldnt mount the component");
        }
    }

    /*
        Prints a row of the user's treatment dates.
        param index: The treatment number.
        data: The data from the treatment such as date and comments.
    */
    printDate(index, data) {
        return(
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{data.date}</td>
                <td>{data.doctor}</td>
                <td>{data.comment}</td>
            </tr>
        );
    }

    /*
        Prints user's treatment schedule on the page.
    */
    render() {
        if (this.state.scheduleData.length === 0) { //Data hasn't been loaded from the server yet
            //Display loading message to the user
            return (
                <div>
                    <Sidebar {...this.props}/>
                    <div className="welcome-bar">
                        <h6 className="welcome">Treatment Schedule</h6>
                    </div>

                    <h4 className="dashboard-loading">Loading...</h4>
                </div>
            );
        }

        return (
            <div className="page">
                <Sidebar {...this.props} />

                <div className="schedule-container">
                    <div className="welcome-bar">
                        <h6 className="welcome">Treatment Schedule</h6>
                    </div>

                    <div className="sub-container schedule-sub-container">
                        <Table bordered variant="white" className="table-primary schedule-table">
                            <thead>
                                <tr>
                                    <th>Treatment</th>
                                    <th>Date</th>
                                    <th>Doctor</th>
                                    <th>Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.scheduleData !== undefined ?
                                        this.state.scheduleData.map((data, index) => this.printDate(index, data))
                                    : <tr><td>Unable to load dates!</td></tr>
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
});

export default connect(mapStateToProps)(Schedule);
