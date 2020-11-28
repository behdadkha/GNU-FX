import React, { Component } from 'react'
import { Button, Col, Row } from 'react-bootstrap';
import dashboardIcon from '../../icons/dashboard2.png';
import scheduleIcon from '../../icons/appointment.png';
import reportIcon from '../../icons/report2.png';
import doctorIcon from '../../icons/doctor.png';
import logoutIcon from '../../icons/logout.png';
import myAccountIcon from '../../icons/myAccount.png';
import '../../componentsStyle/NewSidebar.css';

export default class NewSidebar extends Component {
    render() {
        return (
            <div className="sidebar">
                <div>
                    <Button style={{backgroundColor : "blue"}}>Make Appointment +</Button>
                </div>
                {/* Dashboard */}
                <div className={window.location.pathname === "/user" ? "sidebarItems active" : "sidebarItems"} style={{paddingTop : "20%"}}>
                    <img src={dashboardIcon} alt="dashboard icon" className="sidebarIcon"></img>
                    <h6 className="sidebarItemText">Dashboard</h6>
                </div>
                {/* Treatment Schedule */}
                <div className={window.location.pathname === "/user/schedule" ? "sidebarItems active" : "sidebarItems"}>
                    <img src={scheduleIcon} alt="schedule icon" className="sidebarIcon"></img>
                    <h6 className="sidebarItemText">Treatment Schedule</h6>
                </div>
                {/* Lab Report */}
                <div className={window.location.pathname === "/user/labreports" ? "sidebarItems active" : "sidebarItems"} style={{paddingLeft : "19%"}}>
                    <img src={reportIcon} alt="report icon" style={{width : "10%", marginRight : "4%"}} className="sidebarIcon"></img>
                    <h6 className="sidebarItemText">Lab Report</h6>
                </div>
                {/* Doctors */}
                <div className={window.location.pathname === "/user/doctors" ? "sidebarItems active" : "sidebarItems"}>
                    <img src={doctorIcon} alt="schedule icon" className="sidebarIcon"></img>
                    <h6 className="sidebarItemText">Doctors</h6>
                </div>
                {/* Log out */}
                <div className="sidebarItems" style={{paddingTop : "20%"}}>
                    <img src={logoutIcon} alt="schedule icon" className="sidebarIcon"></img>
                    <h6 className="sidebarItemText">Log Out</h6>
                </div>
                {/* My Account */}
                <div className="sidebarItems" style={{paddingTop : "1%"}}>
                    <img src={myAccountIcon} alt="schedule icon" className="sidebarIcon"></img>
                    <h6 className="sidebarItemText">My Account</h6>
                </div>
            </div>
        )
    }
}
