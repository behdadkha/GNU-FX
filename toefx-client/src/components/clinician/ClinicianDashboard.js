import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import Sidebar from "./Sidebar"

export default class ClinicianDashboard extends Component {
    render() {
        return (
            <Container>
                <Sidebar></Sidebar>
            </Container>
        )
    }
}
