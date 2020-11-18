import React, { Component } from "react";
import { Col, Row, Container, Table } from "react-bootstrap";
import { connect } from "react-redux";
import Sidebar from './Sidebar';
import '../../componentsStyle/User.css';
import Graph from './Graph';
import Axios from "axios";

/*TODO: Change "Create a Storyline" to "My Images"*/

class NewUser extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedToe: 0,
            selectedToeImage: 0, //index of the image in imageUrls array
            numberOfImages: 3,
            selectedRightFoot: true,
            selectedLeftFoot: false,
            toeData: {},
            imageUrls: []//[{imageName: "1.PNG", url : }]
        };
    }

    async componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            this.props.history.push("/Login");

        //get all the user's images and store them in a data array
        for (var i = 1; i <= this.state.numberOfImages; i++) {
            await Axios.get(`http://localhost:3001/getImage?imageName=${i}.PNG`, { responseType: "blob" })
                .then((image) => {
                    this.setState({
                        imageUrls: [...this.state.imageUrls, { imageName: `${i}.PNG`, url: URL.createObjectURL(image.data) }]
                    });
                });
        }

        //get the user's toe data from the node server
        Axios.get("http://localhost:3001/getToe")
            .then((data) => {
                this.setState({
                    toeData: data.data
                })
            });
    }

    //to keep track of which toe is selected
    //toenum is the index of the selected toe
    // image is the name of the selected image
    handleSelectedToe(toeNum, image) {

        let index = this.state.imageUrls.findIndex(({ imageName }) => imageName === image)
        console.log(index);
        this.setState({
            selectedToeImage: index,
            selectedToe: toeNum
        });
    }



    render() {
        console.log(this.state.imageUrls);
        return (
            <Container fluid >
                <Sidebar />
                {/* the top row */}
                <div style={{ width: "80%", marginLeft: "20%" }}>
                    <Row>
                        <Col style={{ paddingRight: "15%" }}>
                            <h6 className="welcome">Welcome {this.props.auth.user.name}!</h6>
                        </Col>
                    </Row>
                    <Row style={{ paddingTop: "3%" }} noGutters={true}>
                        {/* Graph */}
                        <Col lg="5" className="shadow option"
                            style={{ marginRight: "2%" }}
                            onClick={() => this.props.history.push("./Storyline")}
                        >
                            <Graph></Graph>
                        </Col>

                        {/* Galary view */}
                        <Col lg="5" className="shadow option"
                            onClick={() => this.props.history.push("./diagnosis")}
                        >
                            <h6 className="options-headers">Galary View</h6>
                            <img style={{ borderRadius: "10px", width: "400px", height: "300px" }}
                                src={
                                    (this.state.imageUrls[this.state.selectedToeImage] !== undefined
                                        &&
                                        (this.state.imageUrls[this.state.selectedToeImage].url))
                                    ||
                                    ""
                                }
                                alt="toe">
                            </img>
                        </Col>
                    </Row>
                </div>
                <Row style={{ width: "85%", margin: "auto", justifyContent: "center", marginLeft: "14%" }}>
                    {/* right foot and left foot selection */}
                    <Col lg="1" style={{ paddingTop: "5%", textAlign: "left" }}>
                        <input
                            id="rightFoot"
                            type="radio"
                            style={{ marginRight: "5%" }}
                            checked={this.state.selectedRightFoot}
                            onChange={() => this.setState({ selectedRightFoot: true, selectedLeftFoot: false })}>
                        </input>
                        <label htmlFor="rightFoot">Right Foot</label>
                        <input
                            id="leftFoot"
                            type="radio"
                            style={{ marginRight: "5%" }}
                            checked={this.state.selectedLeftFoot}
                            onChange={() => this.setState({ selectedRightFoot: false, selectedLeftFoot: true })}>
                        </input>
                        <label htmlFor="leftFoot">Left Foot</label>
                    </Col>
                    <Col id="tableCol">
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>Selected</th>
                                    <th>Toe</th>
                                    <th>Date</th>
                                    <th>Image</th>
                                    <th>Fungal coverage(%)</th>
                                </tr>
                            </thead>

                            {/* Right foot */}
                            {this.state.selectedRightFoot ?
                                (this.state.toeData.rightFoot !== undefined &&
                                    Object.keys(this.state.toeData.rightFoot).map((toeName, index) =>

                                        <tbody key={index}>

                                            {this.state.toeData.rightFoot[toeName].map((toeElement, toeIndex) =>
                                                <tr key={toeIndex}>
                                                    <th>{toeIndex === 0 && //only the first element of a toe gets the radio input
                                                        <input
                                                            id="first"
                                                            type="radio"
                                                            name="selected"
                                                            checked={index === this.state.selectedToe}
                                                            onChange={this.handleSelectedToe.bind(this, index, toeElement.image)}>
                                                        </input>
                                                    }
                                                    </th>
                                                    <td>{toeName}</td>
                                                    <td>{toeElement.date}</td>
                                                    <td>
                                                        <img
                                                            style={{ width : "100px", height : "100px", borderRadius : "100px"}}
                                                            src={
                                                                this.state.imageUrls[this.state.imageUrls.findIndex(({ imageName }) => imageName === toeElement.image)] !== undefined
                                                                    ?
                                                                    this.state.imageUrls[this.state.imageUrls.findIndex(({ imageName }) => imageName === toeElement.image)].url
                                                                    : ""
                                                            }
                                                            alt="img"
                                                        >
                                                        </img>
                                                    </td>
                                                    <td>{toeElement.fungalCoverage}</td>
                                                </tr>
                                            )}

                                        </tbody>
                                    )
                                )
                                : //else if left foot is selected
                                (this.state.toeData.leftFoot !== undefined &&
                                    Object.keys(this.state.toeData.leftFoot).map((toeName, index) =>

                                        <tbody key={index}>

                                            {this.state.toeData.leftFoot[toeName].map((toeElement, toeIndex) =>
                                                <tr key={toeIndex}>

                                                    <th>{toeIndex === 0 && //only the first element of a toe gets the radio input
                                                        <input
                                                            id="first"
                                                            type="radio"
                                                            name="selected"
                                                            checked={index === this.state.selectedToe}
                                                            onChange={this.handleSelectedToe.bind(this, index)}>
                                                        </input>
                                                    }
                                                    </th>
                                                    <td>{toeName}</td>
                                                    <td>{toeElement.date}</td>
                                                    <td><img src="http://localhost:3001/getImage?imageName=1.PNG" alt="img"></img></td>
                                                    <td>{toeElement.fungalCoverage}</td>
                                                </tr>
                                            )}

                                        </tbody>
                                    )
                                )
                            }
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
