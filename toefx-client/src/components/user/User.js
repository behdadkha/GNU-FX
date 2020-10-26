import React, { Component } from 'react'
import { Col, Row, Container, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import storylineImage from '../../storyline.png';
import diagnosisImage from '../../diagnosis.png';

class User extends Component {

    componentDidMount(){
        //if user is not logged in, go to the login page
        if(!this.props.auth.isAuth){
            this.props.history.push('./Login');
        }
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col>Welcome {this.props.auth.user.name}</Col>
                </Row>
                <Row style={{paddingTop : "10%"}}>
                    <Col className="shadow" style={{marginRight : "2%"}}>
                        <h6>Create a Storyline</h6>
                        <img src={storylineImage} style={{width : "100%"}} alt="story line image"></img>
                        <Button style={{backgroundColor : "red", marginBottom : "2%"}} onClick={() => this.props.history.push('./Storyline')}>Create</Button>
                    </Col>

                    <Col className="shadow">
                        <h6>Diagnosis</h6>
                        <img src={diagnosisImage} style={{width : "100%"}} alt="diagnosis image"></img>
                        <Button style={{backgroundColor : "red", marginBottom : "2%", width : "15%"}} onClick={() => this.props.history.push('./Diagnosis')}>Go</Button>
                    </Col>
                </Row>
            </Container>
        )
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps)(User);