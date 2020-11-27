import React, { Component } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

export default class MyAccount extends Component {
    render() {
        return (
            <Container fluid>
                <Row style={{paddingTop : "1%"}}>
                    {/* Side bar */}
                    <Col lg="2" >
                        <Row>
                            <Button><h6 style={{display : "inline"}}>Register Patient </h6><h5 style={{display : "inline"}}>+</h5></Button>
                        </Row>
                        
                    </Col>
                    <Col style={{backgroundColor : "whitesmoke"}}>
                        <h1>hello</h1>
                    </Col>
                </Row>
            </Container>
        )
    }
}
