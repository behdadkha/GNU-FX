/*
    A class for the navigation bar that can appear at the top of certain pages.
*/

import React, {Component} from "react";
import {Navbar, Nav} from "react-bootstrap";
import {isMobile} from "react-device-detect";
import {connect} from "react-redux"

import store from "../Redux/store";
import {LogOutUser} from "../Redux/Actions/authAction";
import {DoesPageHaveNavBar} from "../Utils";

import "../componentsStyle/Navbar.css";


class NavigationBar extends Component {
    /*
        Prints the list of links visible in the navigation bar for a given page.
    */
    getMenuLinks() {
        var menuLinks;

        //Show special options if user is logged in
        if (this.props.auth.isAuth) {
            menuLinks =
                <Nav className="NavbarFont">
                    {
                        //Only show dashboard link on specific pages
                        (window.location.pathname !== "/user" && !isMobile) &&
                        <Nav.Link href="/user">
                            {isMobile ? "Home" : "Dashboard"}
                        </Nav.Link>
                    }

                    {
                        //Only show upload link on specific pages
                        (window.location.pathname !== "/upload") &&
                        <Nav.Link >
                            Upload
                        </Nav.Link>
                    }

                    {
                        //Only show account link on specific pages
                        (window.location.pathname !== "/user/myAccount") &&
                        <Nav.Link href="/user/myAccount">
                            My Account
                        </Nav.Link>
                    }

                    <Nav.Link test-id="logOut" href="/" onClick={() => store.dispatch(LogOutUser())}>
                        Log Out
                    </Nav.Link>
                </Nav>
        }
        else { //User is not logged in
            if (window.location.pathname === "/") {
                //On the home page show both Login and Sign Up
                menuLinks =
                    <Nav>
                        <Nav.Link href="/login">Login</Nav.Link>
                        <Nav.Link href="/signup">Sign Up</Nav.Link>
                    </Nav>;
            }
            else if (window.location.pathname === "/login") {
                //On the login page show Sign Up
                menuLinks =
                    <Nav>
                        <Nav.Link href="/signup">Sign Up</Nav.Link>
                    </Nav>;
            }
            else if (window.location.pathname === "/signup") {
                //On the signup page show Log In
                menuLinks =
                    <Nav>
                        <Nav.Link href="/login">Log In</Nav.Link>
                    </Nav>;
            }
            else {
                //Probably unused
                menuLinks =
                    <Nav>
                        <Nav.Link href="/login">Log In</Nav.Link>
                        <Nav.Link href="/signup">Sign Up</Nav.Link>
                    </Nav>;
            }
        }

        return menuLinks;
    }

    /*
        Prints the navigation bar to the top of the screen.
    */
    render() {
        var navBarClass = "NavbarFont p-3" + (!isMobile ? " bg-white mb-3 shadow-sm rounded" : "");
        var menuLinks = this.getMenuLinks();
        var homeLink = isMobile && this.props.auth.isAuth ? "/user" : isMobile ? "login" : "/"; //Mobile logged in redirects to image page, otherwise mobile redirects to login page
        return (
            <div>
                {
                    DoesPageHaveNavBar() ? //Navbar on this page
                        <Navbar bg="light" expand="md" className={navBarClass}>
                            {/* Link to home page or dashboard on mobile*/}
                            <Navbar.Brand href={homeLink}>
                                Home
                            </Navbar.Brand>

                            {/* Actual nav bar */}
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="ml-auto">
                                    {menuLinks}
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
