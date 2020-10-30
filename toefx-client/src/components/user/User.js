import React, {Component} from "react";
import {Col, Row, Container, Button} from "react-bootstrap";
import {connect} from "react-redux";
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
                <Row>
                    <Col className="welcome">Welcome {this.props.auth.user.name}!</Col>
                </Row>
                <Row style={{paddingTop: "10%"}}>
                    <Col className="shadow option"
                         style={{marginRight: "2%"}}
                         onClick={() => this.props.history.push("./Storyline")}
                    >
                        <h6 class="options-headers">Create a Storyline</h6>
                        <img
                            src={storylineImage}
                            style={{width: "100%"}}
                            alt="story line image"
                        ></img>
                    </Col>

                    <Col className="shadow option"
                         onClick={() => this.props.history.push("./diagnosis")}
                    >
                        <h6 class="options-headers">Diagnosis</h6>
                        <img
                            src={diagnosisImage}
                            style={{width: "100%"}}
                            alt="diagnosis image"
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
