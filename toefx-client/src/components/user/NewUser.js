import React, { Component } from "react";
import { Col, Row, Container, Table } from "react-bootstrap";
import { connect } from "react-redux";
import Sidebar from './Sidebar';
import diagnosisImage from "../../diagnosis.png";
import '../../componentsStyle/User.css';
import Graph from './Graph';

/*TODO: Change "Create a Storyline" to "My Images"*/

class NewUser extends Component {
    componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            this.props.history.push("./Login");
    }

    render() {
        return (
            <Container fluid style={{ width: "80%", marginLeft: "20%" }}>
                <Sidebar />
                <Row>
                    <Col style={{ paddingRight: "15%" }}>
                        <h6 className="welcome">Welcome {this.props.auth.user.name}!</h6>
                    </Col>
                </Row>
                <Row style={{ paddingTop: "3%" }} noGutters={true}>
                    <Col lg="5" className="shadow option"
                        style={{ marginRight: "2%", width: "200px" }}
                        onClick={() => this.props.history.push("./Storyline")}
                    >
                        <Graph></Graph>
                    </Col>

                    <Col lg="5" className="shadow option"
                        onClick={() => this.props.history.push("./diagnosis")}
                    >
                        <h6 className="options-headers">Diagnosis</h6>
                        <img
                            src={diagnosisImage}
                            style={{ width: "100%" }}
                            alt="diagnosis"
                        ></img>
                    </Col>
                </Row>
                <Row>
                    <Col id="tableCol">
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Finger</th>
                                    <th>Image</th>
                                    <th>Fungal coverage(%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>2020-11-13</td>
                                    <td>Big toe</td>
                                    <td>URL</td>
                                    <td>1%</td>
                                </tr>
                                <tr>
                                    <td>2020-11-10</td>
                                    <td>Index toe</td>
                                    <td>URL</td>
                                    <td>20%</td>
                                </tr>
                                <tr>
                                    <td>2020-11-5</td>
                                    <td>Pinky</td>
                                    <td>URL</td>
                                    <td>90%</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(NewUser);
