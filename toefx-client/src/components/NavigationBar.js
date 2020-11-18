import React, { Component } from "react";
import {
    Navbar,
    Nav,
} from "react-bootstrap";
import { connect } from "react-redux";
import { logOutUser } from "../Redux/Actions/authAction";
import store from "../Redux/store";

class NavigationBar extends Component {
    render() {

        var loginSignup;
        //home page
        if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
            loginSignup =   <Nav>
                                <Nav.Link href="/signup">Sign Up</Nav.Link>
                                <Nav.Link href="/login">Login</Nav.Link>
                            </Nav>;
        //in the login page only show signup
        } else if (window.location.pathname === "/login") {
            loginSignup =   <Nav>
                                <Nav.Link href="/signup">Sign Up</Nav.Link>
                            </Nav>;
        //in the signup page only show login
        } else if (window.location.pathname === "/signup") {
            loginSignup =   <Nav>
                                <Nav.Link href="/login">Login</Nav.Link>
                            </Nav>;
        }

        //show logout if user is logged in
        if (this.props.auth.isAuth) {
            loginSignup = <Nav>
                <Nav.Link onClick={() => { store.dispatch(logOutUser()); window.location.href = "/"; }}>Log Out</Nav.Link>
                {(window.location.pathname !== "/user" && window.location.pathname !== "/login") && <Nav.Link href="/user">Dashboard</Nav.Link>}
            </Nav>
        }

        return (
            <div>
                <Navbar bg="light" expand="md">
                    {/*only show the Toefx if user is not logged in*/}
                    {window.location.pathname !== "/user" &&
                        <Navbar.Brand href="https://www.toefx.com/">
                            ToeFX
                    </Navbar.Brand>
                    }
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {window.location.pathname !== "/user" &&
                            <Nav className="mr-auto">
                                <Nav.Link href="/">Home</Nav.Link>
                            </Nav>
                        }

                        <Nav className="ml-auto">
                            {loginSignup}
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(NavigationBar);
