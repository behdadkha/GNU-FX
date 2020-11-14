import React, { Component } from "react";
import { Col, Row, Container, Table } from "react-bootstrap";
import { connect } from "react-redux";
import Sidebar from './Sidebar';
import diagnosisImage from "../../diagnosis.png";
import '../../componentsStyle/User.css';
import Graph from './Graph';
import Axios from "axios";

/*TODO: Change "Create a Storyline" to "My Images"*/

class NewUser extends Component {

    constructor(props){
        super(props);

        this.state = {
            selectedToe : 0,
            data : [],
            numberOfImages : 3
        };
    }

    componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            this.props.history.push("./Login");

        //get all the user's images and store them in data array
        for(var i = 1; i <= this.state.numberOfImages; i++){
            Axios.get(`http://localhost:3001/getImage?imageName=${i}.PNG`, {responseType : "blob"})
            .then((image) => {
                this.setState({
                    data : [...this.state.data,URL. createObjectURL(image.data)]
                });
            });
        }
        
    }

    //set the "selectedToe" number to the selected toe
    handleSelectedToe(toeNum) {
        this.setState({
            selectedToe : toeNum
        });
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
                        style={{ marginRight: "2%" }}
                        onClick={() => this.props.history.push("./Storyline")}
                    >
                        <Graph></Graph>
                    </Col>

                    <Col lg="5" className="shadow option"
                        onClick={() => this.props.history.push("./diagnosis")}
                    >
                        <h6 className="options-headers">Galary View</h6>
                        <img style={{borderRadius : "10px", width : "400px", height : "300px"}} src={this.state.data[this.state.selectedToe]} alt="toe"></img>
                    </Col>
                </Row>
                <Row>
                    <Col id="tableCol">
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>Selected</th>
                                    <th>Date</th>
                                    <th>Finger</th>
                                    <th>Image</th>
                                    <th>Fungal coverage(%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th><input id="first"type="radio" name="selected" checked={0 === this.state.selectedToe} onChange={this.handleSelectedToe.bind(this,0)}></input></th>
                                    <td>2020-11-13</td>
                                    <td>Big toe</td>
                                    <td>URL</td>
                                    <td>1%</td>
                                </tr>
                                <tr>
                                    <th><input type="radio" name="selected" checked={1 === this.state.selectedToe} onChange={this.handleSelectedToe.bind(this,1)}></input></th>
                                    <td>2020-11-10</td>
                                    <td>Index toe</td>
                                    <td onClick={this.handleSelectedToe.bind(this,1)}>URL</td>
                                    <td>20%</td>
                                </tr>
                                <tr>
                                    <th><input type="radio" name="selected" checked={2 === this.state.selectedToe} onChange={this.handleSelectedToe.bind(this,2)}></input></th>
                                    <td>2020-11-5</td>
                                    <td>Pinky</td>
                                    <td onClick={this.handleSelectedToe.bind(this,2)}>URL</td>
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
