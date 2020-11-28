import React, { Component } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import NewSidebar from "./NewSidebar";

export default class MyAccount extends Component {
    render() {
        return (
            <div style={{ overflow: "hidden" }}>
                <NewSidebar></NewSidebar>
                <div style={{overflow : "hidden", height : "4vh" }}>

                </div>
                <div style={{overflow : "hidden", backgroundColor : "#8ef1f5", height : "100vh" }}>
                    
                </div>
            </div>
        )
    }
}
