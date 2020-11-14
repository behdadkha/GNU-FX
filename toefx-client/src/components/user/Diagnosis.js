import React, { Component } from "react";
import { Button, Container, Col, Row } from "react-bootstrap";
import "../../componentsStyle/Storyline.css";
import axios from "axios";
import { connect } from "react-redux";

class Diagnosis extends Component {
    constructor(props) {
        super(props);

        this.state = {
            input: "Upload",
            uploaded: false,
            files: [], //currently uploaded files
            diagnosis: [], //[{image: 0, text:""}]
            uploadProgress: 0,
        };
    }

    componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            this.props.history.push("./Login");
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

        let currentImageIndex = this.state.files.length;
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        axios.post("http://localhost:3001/upload", formData, {
            onUploadProgress: (ProgressEvent) => {
                let progress = Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100) + "%";
                this.setState({ uploadProgress: progress });
            },
        })
            .then((res) => {
                console.log(res);
            });

        axios.get(`http://localhost:3001/imagevalidation/?imageName=${file.name}`)
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

    //index => files[index]
    //sends the imagename as a query string imageName=
    handleDiagnose = async (index) => {
        let imageName = this.state.files[index].name;
        const response = await fetch(
            `http://localhost:3001/diagnose/?imageName=${imageName}`,
            {
                method: "GET",
            }
        );

        let responseText = await response.text();
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
