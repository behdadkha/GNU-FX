/*
    A class for the navigation bar that can appear at the top of certain pages.
*/

import React, {Component} from "react";
import {Navbar, Nav} from "react-bootstrap";
import {connect} from "react-redux";

import store from "../Redux/store";
import {LogOutUser} from "../Redux/Actions/authAction";
import "../componentsStyle/Navbar.css";

class NavigationBar extends Component {
    /*
        Prints the navigation bar to the top of the screen.
    */
    render() {
        var loginSignup, logo, loggedInNav;
        var pagesWithNavbar = ["/", "/login", "/signup", "/upload"];
       
        //Show Dashboard and Log Out if user is logged in
        if (this.props.auth.isAuth) {
            loginSignup =
            <Nav className="NavbarFont">
                <Nav.Link test-id="logOut" onClick={() => {store.dispatch(LogOutUser()); window.location.href = "/";}}>
                    Log Out
                </Nav.Link>
                {(window.location.pathname !== "/user" && window.location.pathname !== "/login") &&
                <Nav.Link href="/user">
                    Dashboard
                </Nav.Link>}
            </Nav>
        }
        else { //User is not logged in
            if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
                //On the home page show both Login and Sign Up
                loginSignup =
                <Nav>
                    <Nav.Link href="/signup">Sign Up</Nav.Link>
                    <Nav.Link href="/login">Login</Nav.Link>
                </Nav>;
            }
            else if (window.location.pathname === "/login") {
                //On the login page only show Sign Up
                loginSignup = <Nav>
                    <Nav.Link href="/signup">Sign Up</Nav.Link>
                </Nav>;
            }
            else if (window.location.pathname === "/signup") {
                //On the signup page only show Login
                loginSignup = <Nav>
                    <Nav.Link href="/login">Login</Nav.Link>
                </Nav>;
            }
        }

        logo = "";
        loggedInNav = "";
        if (window.location.pathname !== "/user") {
            //Only show the ToeFX logo on the home page
            logo =
            <Navbar.Brand href="https://www.toefx.com/">
                ToeFX
            </Navbar.Brand>;

            //Only show special logged in options on the home page
            loggedInNav =
            <Nav className="mr-auto">
                <Nav.Link href="/">Home</Nav.Link>
                <Nav.Link href="/upload">Diagnosis</Nav.Link>
            </Nav>;
        }
        
        return (
            <div>
                {
                    pagesWithNavbar.includes(window.location.pathname) ? //Navbar on this page
                        <Navbar bg="light" expand="md" className="shadow-sm p-3 mb-5 bg-white rounded NavbarFont">
                            {/* Potentially show ToeFX logo */}
                            {logo}

                            {/* Actual nav bar */}
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                {loggedInNav}

                                <Nav className="ml-auto">
                                    {loginSignup}
                                </Nav>
                            </Navbar.Collapse>
                        </Navbar>
                    : ""
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(NavigationBar);
