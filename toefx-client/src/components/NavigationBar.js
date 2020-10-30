import React, {Component} from "react";
import {
    Navbar,
    Nav,
    NavDropdown,
    Form,
    FormControl,
    Button,
} from "react-bootstrap";
import {connect} from "react-redux";
import {logOutUser} from "../Redux/Actions/authAction";
import store from "../Redux/store";

class NavigationBar extends Component {
    render() {
        //console.log(window.location.pathname);
        var loginSignup;
        console.log(window.location.pathname);
        if(window.location.pathname !== "/login" && window.location.pathname !== "/signup"){
            loginSignup =   <Nav>
                                    <Nav.Link href="/signup">Sign Up</Nav.Link>
                                    <Nav.Link href="/login">Login</Nav.Link>
                            </Nav>;
        }else if(window.location.pathname === "/login"){
            loginSignup =   <Nav>
                                    <Nav.Link href="/signup">Sign Up</Nav.Link>
                            </Nav>;
        }else if(window.location.pathname === "/signup"){
            loginSignup =   <Nav>
                                    <Nav.Link href="/login">Login</Nav.Link>
                            </Nav>;
        }
        
        //show logout if user is logged in
        if(this.props.auth.isAuth){
            loginSignup = <Nav>
                                <Nav.Link onClick={() => { store.dispatch(logOutUser()); window.location.href = "./"; }} >Log Out</Nav.Link>
                                {(window.location.pathname !== "/user" && window.location.pathname !== "/login") && <Nav.Link href="./user">Dashboard</Nav.Link>}
                          </Nav>
        }

        return (
            <div>
                <Navbar bg="light" expand="md">
                    <Navbar.Brand href="https://www.toefx.com/">
                        ToeFX
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            <Nav.Link href="/">Home</Nav.Link>
                        </Nav>

                        {loginSignup}
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
