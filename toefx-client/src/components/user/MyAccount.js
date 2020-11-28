import React, { Component } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import Sidebar from "./Sidebar";

export default class MyAccount extends Component {
    constructor(props){
        super(props);
    }
    render() {
        return (
            <div style={{ overflow: "hidden" }}>
                <Sidebar {...this.props}></Sidebar>

                <div style={{overflow : "hidden", textAlign : "left" }}>
                    <h5 style={{padding: "1.5% 0 1% 4%"}}>Setting</h5>
                </div>
                <div style={{overflow : "hidden", backgroundColor : "#8ef1f5", height : "100vh" }}>
                    
                </div>
            </div>
        )
    }
}
