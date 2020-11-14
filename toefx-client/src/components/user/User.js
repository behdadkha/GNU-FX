import React, {Component} from "react";
import {Col, Row, Container} from "react-bootstrap";
import {connect} from "react-redux";
import Sidebar from './Sidebar';
import storylineImage from "../../storyline.png";
import diagnosisImage from "../../diagnosis.png";
import '../../componentsStyle/User.css';

/*TODO: Change "Create a Storyline" to "My Images"*/

class User extends Component {
    componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            this.props.history.push("./Login");
    }

    render() {
        return (
            <Container>
                <Sidebar />
                <Row>
                    <Col className="welcome">Welcome {this.props.auth.user.name}!</Col>
                </Row>
                <Row style={{paddingTop: "10%"}}>
                    <Col className="shadow option"
                         style={{marginRight: "2%"}}
                         onClick={() => this.props.history.push("./Storyline")}
                    >
                        <h6 className="options-headers">Create a Storyline</h6>
                        <img
                            src={storylineImage}
                            style={{width: "100%"}}
                            alt="story line"
                        ></img>
                    </Col>

                    <Col className="shadow option"
                         onClick={() => this.props.history.push("./diagnosis")}
                    >
                        <h6 className="options-headers">Diagnosis</h6>
                        <img
                            src={diagnosisImage}
                            style={{width: "100%"}}
                            alt="diagnosis"
                        ></img>
                    </Col>
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(User);
