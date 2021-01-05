import React, { Component } from "react";
import { Button, Container, Col, Row } from "react-bootstrap";
import { connect } from "react-redux";
import axios from "axios";
import "../../componentsStyle/Storyline.css";


class Diagnosis extends Component {
    constructor(props) {
        super(props);

        this.state = {
            input: "Upload",
            uploaded: false,
            files: [], //currently uploaded files
            diagnosis: [], //[{image: 0, text:""}]
            uploadProgress: 0,
            tempfileName: ""
        };

        this.validateImage = this.validateImage.bind(this);
    }

    //Diagnosis is accessible from the homepage without being required to login
    /*
    componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            this.props.history.push("./Login");
    }
    */

    //request an iamge validation
    validateImage(file) {
        this.setState({ tempfileName: file });
        console.log("here");
        let currentImageIndex = this.state.files.length - 1;
        //If user is loggedin(which means that the images has to be stores on the database and a <userid> folder exists)
        if (this.props.auth.isAuth) {
            axios.get(`http://localhost:3001/imagevalidation/loggedin`)
                .then(res => {
                    var response = res.data;
                    response = response.trim();
                    var valid, text;
                    if (response === "toe") {
                        valid = true;
                        text = "Toe detected"
                    }
                    else {
                        valid = false;
                        text = "It doesn't look like a toe"
                    }
                    let tempFiles = this.state.files;
                    console.log(tempFiles, currentImageIndex);
                    tempFiles[currentImageIndex].valid = valid;
                    tempFiles[currentImageIndex].text = text;
                    this.setState({
                        files: tempFiles
                    });
                })
                .catch((err) => {
                    console.log(err)
                });
        }
        else {
            axios.post(`http://localhost:3001/imagevalidation/notloggedin`, { myimg: file })
                .then(res => {
                    var response = res.data;
                    response = response.trim();
                    var valid, text;
                    if (response === "toe") {
                        valid = true;
                        text = "Toe detected"
                    }
                    else {
                        valid = false;
                        text = "It doesn't look like a toe"
                    }
                    let tempFiles = this.state.files;
                    console.log(tempFiles, currentImageIndex);
                    tempFiles[currentImageIndex].valid = valid;
                    tempFiles[currentImageIndex].text = text;
                    this.setState({
                        files: tempFiles
                    });
                })
                .catch((err) => {
                    console.log(err)
                });
        }

    }

    //e => event
    handleUpload(e) {
        let file = e.target.files[0];
        this.setState({
            files: [
                ...this.state.files,
                { url: URL.createObjectURL(file), name: file.name, valid: false, text: 'Processing your image...' },
            ],
            uploaded: true,
            input: file.name,
        });


        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        if (this.props.auth.isAuth) {
            axios.post("http://localhost:3001/upload/loggedin", formData, {
                onUploadProgress: (ProgressEvent) => {
                    let progress = Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100) + "%";
                    this.setState({ uploadProgress: progress });
                },
            })
                .then((res) => {
                    console.log("Done, now validating the image")
                    this.validateImage(file);
                });
        }
        else {
            axios.post("http://localhost:3001/upload/notloggedin", formData, {
                onUploadProgress: (ProgressEvent) => {
                    let progress = Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100) + "%";
                    this.setState({ uploadProgress: progress });
                },
            })
                .then((res) => {
                    console.log("Done, now validating the image")
                    this.validateImage(res.data.img);
                });
        }


    }

    //index => files[index]
    //sends the imagename as a query string imageName=
    handleDiagnose = async (index) => {
        if (this.props.auth.isAuth) {
            let imageName = this.state.files[index].name;
            console.log("image name: " + imageName);
            var responseText = ""
            await axios.get(`http://localhost:3001/diagnose/loggedin/?imageName=${imageName}`)
                .then((res) => {
                    responseText = res.data;
                })
        }
        else {
            //tempfileName = time(in milisecond) when it is uploaded
            let imageName = this.state.tempfileName;
            console.log("image name: " + imageName);
            var responseText = ""
            await axios.get(`http://localhost:3001/diagnose/notloggedin/?imageName=${imageName}`)
                .then((res) => {
                    responseText = res.data;
                })
        }


        /*const response = await fetch(
            `http://localhost:3001/diagnose/?imageName=${imageName}`,
            {
                method: "GET",
                headers: new Headers({
                    'Authorization': Basic
                })
            }
        );*/

        //let responseText = await response.data;
        //console.log(responseText)
        this.setState({
            diagnosis: [
                ...this.state.diagnosis,
                { image: index, text: responseText, diagnosisButton: true },
            ],
        });


    };

    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        {/*uploadfile*/}
                        <div className="input-group">
                            <div className="custom-file">
                                <input
                                    type="file"
                                    className="custom-file-input"
                                    id="inputGroupFile01"
                                    aria-describedby="inputGroupFileAddon01"
                                    onChange={this.handleUpload.bind(this)}
                                />
                                <label className="upload-image" htmlFor="inputGroupFile01">
                                    <div>
                                        <h6 style={{ display: "inline" }}>
                                            Upload
                                        </h6>
                                        {this.state.uploadProgress !== 0 && (
                                            <h6
                                                style={{
                                                    paddingLeft: 40,
                                                    display: "inline",
                                                }}
                                            >
                                                {this.state.uploadProgress}
                                            </h6>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    {this.state.files.map((source, index) => (
                        <Col key={`col-${index}`}>
                            <Row>
                                <Col>
                                    <img key={index} src={source.url} style={{ width: "40%" }} alt="uploaded" />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div>{source.text}</div>
                                    <Button onClick={this.handleDiagnose.bind(this, index)} disabled={!source.valid}>
                                        Diagnose
                                    </Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    {this.state.diagnosis.length > index && (
                                        <div style={{ margin: "auto" }} className="card w-50" >
                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    Results
                                                </h5>
                                                <p className="card-text">
                                                    {
                                                        this.state.diagnosis[
                                                            this.state.diagnosis.findIndex(
                                                                ({ image }) => image === index)
                                                        ].text
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Col>
                    ))}
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(Diagnosis);
