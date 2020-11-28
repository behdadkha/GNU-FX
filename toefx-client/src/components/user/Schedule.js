import React, { Component } from 'react'
import Sidebar from './Sidebar'
import { connect } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import { Table } from 'react-bootstrap';
import '../../componentsStyle/Schedule.css'
import Axios from "axios";

class Schedule extends Component {
    constructor(props){
        super(props);
        //schedule data has user's schedule data such as date, comment, docker's name
        this.state = {scheduleData: []}
    }
    async componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            this.props.history.push("/Login");

        //gets user's schedule(set by clinician)
        Axios.get("http://localhost:3001/user/getschedule")
            .then((data) => {
                this.setState({
                    scheduleData: data.data
                })
            });
    }

    //gets user's schedule
    
    render() {
        return (
            <div>
                <Sidebar {...this.props} />
                <Table bordered variant="white" className="table-primary" style={{marginLeft: "16%", width: "80%", marginTop: "1%"}}>
                    
                    <thead>
                        <tr>
                            <th>Treatment</th>
                            <th>Date</th>
                            <th>comment</th>
                            <th>Doctor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.scheduleData !== undefined ? this.state.scheduleData.map((data, index) => { 
                            return(
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{data.date}</td>
                                <td>{data.comment}</td>
                                <td>{data.doctor}</td>
                            </tr>
                            )
                        }) : <tr><td>can't load date</td></tr>}

                    </tbody>
                </Table>
            </div>
        )
    }
}
const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(Schedule);
