/*
    A class for the navigation bar that appears on the side of the dashboard.
*/

import React, {Component} from 'react'
import {isMobile} from 'react-device-detect';
import {Container, Button, Row, Navbar, Nav} from 'react-bootstrap';

import {connect} from "react-redux";
import store from "../../Redux/store";
import {LogOutUser} from "../../Redux/Actions/authAction";

import DashboardIcon from '../../icons/dashboard2.png';
import LogOutIcon from '../../icons/logout.png';
import MyAccountIcon from '../../icons/myAccount.png';

import '../../componentsStyle/Sidebar.css';


class Sidebar extends Component {
    /*
        Prints the sidebar to the dashboard.
    */
    render() {
        var itemClass = "sidebar-items";
        var activeItemClass = itemClass + " sidebar-active-item"; //Highlight nav link when on page
        var iconClass = "sidebar-icon";
        var navLinkClass = "sidebar-item-text";

        if (isMobile) { //Adjust on mobile devices
            return (
                <Navbar bg="light" expand="lg" variant="light" className="mobile-navbar">
                    <Navbar.Brand test-id="mobile-dashboard"
                        onClick={() => {
                            window.location.href = "/user";
                        }}
                    >
                        Home
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav"> {/* Hamburger menu */}
                        <Nav className="mr-auto">
                            <Nav.Link test-id="mobile-myAccount" onClick={() => window.location.href = "/user/myAccount"}>My Account</Nav.Link>
                            <Nav.Link test-id="mobile-logOut" onClick={() => {
                                store.dispatch(LogOutUser());
                                window.location.href = "/";
                            }}>Log Out</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            )
        }
        else {
            return (
                <div className="sidebar">
                    {/* Upload Image Button */}
                    <div>
                        <Button id="uploadBtn" className="uploadButton"
                            onClick={() => {
                                window.location.href = "/upload";
                            }}
                        >+ Upload Image</Button>
                    </div>

                    {/* Nav Options - Highlight when seleected */}
                    <Container className="main-sidebar-options">
                        {/* Dashboard */}
                        <Row test-id="dashboardRow" className={window.location.pathname === "/user" ? activeItemClass : itemClass}>
                            <span test-id="dashboard" onClick={() => window.location.pathname !== "/user/myAccount" ? window.location.href = "/user" : this.props.history.push("/user")}>
                                <img src={DashboardIcon} alt="Dashboard-Icon" className={iconClass}></img>
                                <h6 className={navLinkClass}>Dashboard</h6>
                            </span>
                        </Row>

                        {/* My Account */}
                        <Row test-id="myAccountRow" className={window.location.pathname === "/user/myAccount" ? activeItemClass : itemClass}>
                            <span test-id="myAccount" onClick={() => this.props.history.push('/user/myAccount')}> 
                                <img src={MyAccountIcon} alt="Account-Icon" className={iconClass}></img>
                                <h6 className={navLinkClass}>My Account</h6>
                            </span>
                        </Row>

                        {/* Log out */}
                        <Row className={itemClass}>
                            <span test-id="logOut" id="logOut" onClick={() => {
                                store.dispatch(LogOutUser());
                                window.location.href = "/";
                            }}>
                                <img src={LogOutIcon} alt="Log-Out-Icon" className={iconClass}></img>
                                <h6 className={navLinkClass}>Log Out</h6>
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
