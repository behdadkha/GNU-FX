import React, { Component } from 'react';
import '../../componentsStyle/Sidebar.css'
import dashboardIcon from '../../icons/dashboard.png';
import scheduleIcon from '../../icons/schedule.png';
import reportIcon from '../../icons/report.png';

export default class Sidebar extends Component {
    constructor(props){
        super(props);
        this.state = {active1: true, active2: false, active3: false}
    }
    render() {
        return (
            <div className="wrapper">
                <div id="sidebar">
                    <div className="sidebar-header">
                        <h3>Toefx</h3>
                    </div>

                    <div className="components">
                        <a href="/user">
                            <div className={window.location.pathname ==="/user" ? "sidebarItem active" : "sidebarItem"}>
                                <img className="icon" src={dashboardIcon} alt="dashbord icon"></img>
                                <h6 className="itemText" >My Dashboard</h6>
                            </div>
                        </a>
                        <a href="/user/schedule">
                            <div className={window.location.pathname ==="/user/schedule" ? "sidebarItem active" : "sidebarItem"} >
                                <img className="icon" src={scheduleIcon} alt="schedule icon"></img>
                                <h6 className="itemText">Treatment Schedule</h6>
                            </div>
                        </a>
                        <a href="/user/labreports">
                            <div className={window.location.pathname ==="/user/labreports" ? "sidebarItem active" : "sidebarItem"}>
                                <img className="icon" src={reportIcon} alt="report icon"></img>
                                <h6 className="itemText">Lab Reports</h6>
                            </div>
                        </a>
                        <div className="logoutAndMyAccount" style={{paddingTop : "40%"}}>
                            <h6 className="itemText">Log Out</h6>
                        </div>
                        <div className="logoutAndMyAccount">
                            <h6 className="itemText">My Account</h6>
                        </div>
                    </div>

                </div>
            </div >
        )
    }
}
