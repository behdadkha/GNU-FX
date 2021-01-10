import React, { Component } from 'react'
import { Container, Button, Row, Navbar, Nav, Form, FormControl } from 'react-bootstrap';
import { connect } from "react-redux";
import { logOutUser } from "../../Redux/Actions/authAction";
import store from "../../Redux/store";
import { isMobile } from 'react-device-detect';
import dashboardIcon from '../../icons/dashboard2.png';
import scheduleIcon from '../../icons/appointment.png';
import logoutIcon from '../../icons/logout.png';
import myAccountIcon from '../../icons/myAccount.png';
import '../../componentsStyle/Sidebar.css';

class Sidebar extends Component {
    render() {
        if (isMobile) {
            return (
                <Navbar bg="dark" expand="lg" variant="dark">

                    <Navbar.Brand style={{ color: "white" }} onClick={() => {
                        this.props.history.push('/user');
                        window.location.reload();
                    }}>Dashboard</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            <Nav.Link href="#link" onClick={() => { this.props.history.push("/user/schedule") }}>Treatment Schedule</Nav.Link>
                            <Nav.Link href="#link" onClick={() => this.props.history.push("/user/myAccount")}>My Account</Nav.Link>
                            <Nav.Link href="#link" onClick={() => {
                                store.dispatch(logOutUser());
                                window.location.href = "/";
                            }}>Log out</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            )
        }
        else {
            return (
                
                <div className="sidebar">
                    <div>
                        <Button className="new-appointment-button" onClick={() => {
                            this.props.history.push('/diagnosis');
                            window.location.reload();
                        }
                        }>+ Upload Image</Button>
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
                        {/*<Row className={window.location.pathname === "/user/labReports" ? "sidebar-items sidebar-active-item" : "sidebar-items"}>
                            <span onClick={() => this.props.history.push("/user/labReports")}>
                                <img src={reportIcon} alt="report icon" style={{ width: "10%", marginRight: "4%" }} className="sidebar-icon"></img>
                                <h6 className="sidebar-item-text">Lab Reports</h6>
                            </span>
                        </Row>*/}

                    </Container>

                    <Container>
                        {/* My Account */}
                        <Row className="sidebar-items">
                            <span onClick={() => this.props.history.push("/user/myAccount")}>
                                <img src={myAccountIcon} alt="schedule icon" className="sidebar-icon"></img>
                                <h6 className="sidebar-item-text">My Account</h6>
                            </span>
                        </Row>

                        {/* Log out */}
                        <Row className="sidebar-items">
                            <span onClick={() => {
                                store.dispatch(logOutUser());
                                window.location.href = "/";
                            }}
                            >
                                <img src={logoutIcon} alt="schedule icon" className="sidebar-icon" style={{ paddingLeft: "3%", marginRight: "5px" }}></img>
                                <h6 className="sidebar-item-text"> Log Out</h6>
                            </span>
                        </Row>
                    </Container>
                </div>
            )
        }
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(Sidebar);
