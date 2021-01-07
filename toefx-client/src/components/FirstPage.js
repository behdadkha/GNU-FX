/*
    Class for the home page of the app. It is designed to look
    similar to ToeFX's main website.
*/

import React, {Component} from "react";
import {Col, Container, Row} from "react-bootstrap";
import "../componentsStyle/FirstPage.css";


export default class FirstPage extends Component {
    render() {
        return (
            <div>
                <div>
                    <img className="image"
                         src="https://toefx.com/wp-content/uploads/2019/09/pipette.jpg"
                         alt="pipette"
                    ></img>
                </div>

                <Container>
                    <Row>
                        <Col lg={4}>
                            <div className="box box1">
                                <h6 className="boxHeading">About ToeFX</h6>
                                <div className="boxDescriptionDiv">
                                    <h6 className="boxDescription">
                                        ToeFX Inc. is a Canadian medical device
                                        company that has created a safe, fast
                                        solution for the treatment of toenail
                                        fungus (onychomycosis). The solution is
                                        based on photodynamic therapy. Visit our
                                        online store at www.drtoe.com.
                                    </h6>
                                </div>
                            </div>
                        </Col>
                        <Col lg={4}>
                            <div className="box box2">
                                <h6 className="boxHeading">Online Diagnosis</h6>
                                <div className="boxDescriptionDiv">
                                    <h6 className="boxDescription">
                                        With two easy steps, find out if your
                                        toenails are infected.
                                    </h6>
                                </div>
                            </div>
                        </Col>
                        <Col lg={4}>
                            <div className="box box3">
                                <h6 className="boxHeading">Create Your Storyline</h6>
                                <div className="boxDescriptionDiv">
                                    <h6 className="boxDescription">
                                        Take pictures of your toenails during
                                        the course of your treatment and create
                                        a storyline of your treatment progress.
                                    </h6>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}
