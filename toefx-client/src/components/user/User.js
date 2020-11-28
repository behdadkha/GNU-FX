import React, { Component } from "react";
import { Col, Row, Container, Table, Carousel } from "react-bootstrap";
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
            selectedFoot: 0, //0 for right foot, 1 for left
            toeData: {}, //recieved from the server
            imageUrls: [],//[{imageName: "1.PNG", url : }]
        };
    }

    async componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            this.props.history.push("/login");


        await Axios.get(`http://localhost:3001/getImageNames`)
            .then(async (imageNames) => {

                //get all the user's images and store them in a data array
                for (var i = 0; i < imageNames.data.length; i++) {
                    await Axios.get(`http://localhost:3001/getImage?imageName=${imageNames.data[i]}`, { responseType: "blob" })
                        .then((image) => {
                            this.setState({
                                imageUrls: [...this.state.imageUrls, { imageName: imageNames.data[i], url: URL.createObjectURL(image.data) }]
                            });
                        });
                }

            });


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
        this.setState({
            selectedToeImage: index,
            selectedToe: toeNum
        });
    }


    render() {
        return (
            <div>
                <Sidebar {...this.props}/>
                <div style={{ backgroundColor: "white", overflow: "hidden", paddingBottom: "1%", borderRadius: "10px" }}>
                    <h6 className="welcome">Welcome {this.props.auth.user.name}!</h6>
                </div>
                <div style={{ overflow: "hidden", backgroundColor: "#7bedeb" }}>
                    {/* the top row */}
                    <div style={{ overflow: "hidden", marginLeft: "10%" }}>
                        <Row>
                            <Col style={{ paddingRight: "15%" }}>

                            </Col>
                        </Row>
                        <Row style={{ paddingTop: "3%" }} noGutters={true}>
                            {/* Graph */}
                            <Col
                                lg="5"
                                className="option"
                                style={{ marginRight: "2%", minHeight: "45vh" }}
                                onClick={() => this.props.history.push("./Storyline")}
                            >
                                <div style={{ padding: "10% 0 5% 5%" }}>
                                    <Graph></Graph>
                                </div>
                            </Col>

                            {/* Galary view */}
                            <Col lg="5" className="option">

                                <h6 className="options-headers" style={{ color: "gray" }}>Gallery View</h6>
                                <Carousel
                                    interval={null}
                                    style={{
                                        width: "60%",
                                        margin: "auto",
                                        paddingTop: "4%",
                                    }}
                                >

                                    {/*Iterate over the selected toe's images */}
                                    {((Object.keys(this.state.toeData).length !== 0) && Object.values(Object.values(this.state.toeData)[this.state.selectedFoot + 2])[this.state.selectedToe] !== undefined) &&
                                        Object.values(Object.values(this.state.toeData)[this.state.selectedFoot + 2])[this.state.selectedToe].map(({ image }, index) =>
                                            <Carousel.Item key={index}>
                                                <img
                                                    className="d-block w-100"
                                                    style={{ width: "100%", maxHeight: "250px", border: "2px solid lightblue", borderRadius: "5px" }}
                                                    src={this.state.imageUrls[this.state.imageUrls.findIndex(({ imageName }) => imageName === image)].url}
                                                    alt="Slides"
                                                />
                                            </Carousel.Item>
                                        )}

                                </Carousel>
                            </Col>
                        </Row>
                    </div>
                    <div style={{ overflow: "hidden", paddingLeft: "10%" }}>

                        {/* Table column*/}
                        <div id="tableCol" style={{ position: "relative", backgroundColor: "white" }}>

                            {/* left and right foot selection */}
                            <div 
                                className={this.state.selectedFoot === 0 ? "tab activeTab" : "tab"} 
                                onClick={() => this.setState({ selectedFoot: 0 })}
                            >
                                <h6 style={{ padding: "2%" }}>Right Foot</h6>
                            </div>
                            <div 
                                className={this.state.selectedFoot === 1 ? "tab activeTab" : "tab"} 
                                style={{left : "8%"}} 
                                onClick={() => this.setState({ selectedFoot: 1 })}
                            >
                                <h6 style={{ padding: "2%" }}>Left Foot</h6>
                            </div>

                            {/* Table itself */}
                            <div style={{ padding: "5%" }}>
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
                                    {this.state.selectedFoot === 0 ?
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
                                                                    style={{marginTop : "35%"}}
                                                                    checked={index === this.state.selectedToe}
                                                                    onChange={this.handleSelectedToe.bind(this, index, toeElement.image)}>
                                                                </input>
                                                            }
                                                            </th>
                                                            <td><h6 style={{marginTop : "25%"}}>{toeName}</h6></td>
                                                            <td><h6 style={{marginTop : "12%"}}>{toeElement.date}</h6></td>
                                                            <td>
                                                                <img
                                                                    style={{ width: "100px", height: "100px", borderRadius: "100px" }}
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
                                                            <td><h6 style={{marginTop : "15%"}}>{toeElement.fungalCoverage}</h6></td>
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
                                                            <td>
                                                                <img
                                                                    style={{ width: "100px", height: "100px", borderRadius: "100px" }}
                                                                    src={
                                                                        this.state.imageUrls[this.state.imageUrls.findIndex(({ imageName }) => imageName === toeElement.image)] !== undefined
                                                                            ?
                                                                            this.state.imageUrls[this.state.imageUrls.findIndex(({ imageName }) => imageName === toeElement.image)].url
                                                                            : ""
                                                                    }
                                                                    alt="img"></img></td>
                                                            <td>{toeElement.fungalCoverage}</td>
                                                        </tr>
                                                    )}

                                                </tbody>
                                            )
                                        )
                                    }
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(NewUser);
