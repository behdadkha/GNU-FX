import React, { Component } from 'react'
import {Navbar, Nav, NavDropdown, Form, FormControl,  Button} from 'react-bootstrap' 

export default class NavigationBar extends Component {
    render() {
        return (
            <div>
               <Navbar bg="light" expand="md">
                <Navbar.Brand href="https://www.toefx.com/">ToeFX</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                    <Nav.Link href="/">Home</Nav.Link>
                    </Nav>
                    
                <Nav>
                    <Nav.Link href="/signup">Signup</Nav.Link>
                    <Nav.Link href="/login">Login</Nav.Link>
                </Nav>
                </Navbar.Collapse>
                </Navbar> 
                
            </div>
        )
    }
}
