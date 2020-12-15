import React, { Component } from 'react'
import { Container, Button, Row } from 'react-bootstrap';
import { connect } from "react-redux";
import { logOutUser } from "../../Redux/Actions/authAction";
import store from "../../Redux/store";
import dashboardIcon from '../../icons/dashboard2.png';
import scheduleIcon from '../../icons/appointment.png';
import reportIcon from '../../icons/report2.png';
import doctorIcon from '../../icons/doctor.png';
import logoutIcon from '../../icons/logout.png';
import myAccountIcon from '../../icons/myAccount.png';
import '../../componentsStyle/Sidebar.css';

class Sidebar extends Component {
    render() {
        return (
            <div className="sidebar">

                <div>
                    <Button className="new-appointment-button">+ Upload Image</Button>
                </div>

                <Container className="main-sidebar-options">
                    {/* Dashboard */}
                    <Row className={window.location.pathname === "/user" ? "sidebar-items sidebar-active-item" : "sidebar-items"}>
                        <span onClick={() => this.props.history.push("/user")}>
                            <img src={dashboardIcon} alt="dashboard icon" className="sidebar-icon"></img>
                            <h6 className="sidebar-item-text">Dashboard</h6>
                        </span>
                    </Row>

                    {/* Treatment Schedule */}
                    <Row className={window.location.pathname === "/user/schedule" ? "sidebar-items sidebar-active-item" : "sidebar-items"}>
                        <span onClick={() => this.props.history.push("/user/schedule")}>
                            <img src={scheduleIcon} alt="schedule icon" className="sidebar-icon"></img>
                            <h6 className="sidebar-item-text">Treatment Schedule</h6>
                        </span>
                    </Row>

                    {/* Lab Report */}
                    <Row className={window.location.pathname === "/user/labReports" ? "sidebar-items sidebar-active-item" : "sidebar-items"}>
                        <span onClick={() => this.props.history.push("/user/labReports")}>
                            <img src={reportIcon} alt="report icon" style={{ width: "10%", marginRight: "4%" }} className="sidebar-icon"></img>
                            <h6 className="sidebar-item-text">Lab Reports</h6>
                        </span>
                    </Row>

                    {/* Doctors */}
                    <Row className={window.location.pathname === "/user/doctors" ? "sidebar-items sidebar-active-item" : "sidebar-items"}>
                        <span onClick={() => this.props.history.push("/user/doctors")}>
                            <img src={doctorIcon} alt="schedule icon" className="sidebar-icon"></img>
                            <h6 className="sidebar-item-text">Clinicians</h6>
                        </span>
                    </Row>
                </Container>

                <Container className="account-sidebar-options">
                    {/* My Account */}
                    <Row className="sidebar-items">
                        <span onClick={() => this.props.history.push("/user/myAccount")}>
                            <img src={myAccountIcon} alt="schedule icon" className="sidebar-icon"></img>
                            <h6 className="sidebar-item-text">My Account</h6>
                        </span>
                    </Row>

                    {/* Log out */}
                    <Row className="sidebar-items">
                        <span onClick={() =>{
                                    store.dispatch(logOutUser());
                                    window.location.href = "/";
                                }}
                        >
                            <img src={logoutIcon} alt="schedule icon" className="sidebar-icon"></img>
                            <h6 className="sidebar-item-text"> Log Out</h6>
                        </span>
                    </Row>
                </Container>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(Sidebar);
