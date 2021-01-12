import React, { Component } from "react";
import { Button, Container, Col, Row, ButtonGroup, ToggleButton } from "react-bootstrap";
import { connect } from "react-redux";
import axios from "axios";
import "../../componentsStyle/Diagnosis.css";


class Diagnosis extends Component {
    constructor(props) {
        super(props);

        this.state = {
            input: "Upload",
            uploaded: false,
            files: [], //currently uploaded files
            diagnosis: [], //[{image: 0, text:""}]
            uploadProgress: 0,
            tempfileName: "",
            foot: "",//can be selected from UI. Sent to /uploadimage endpoint
            toe: "",
            errorText: "",
            toeRadioBtnValue: -1,
            footRadioBtnValue: -1,
            error: ""
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
    onBackButtonEvent(e) {
        e.preventDefault();
        window.location.reload();
    }
    componentDidMount() {
        window.onpopstate = this.onBackButtonEvent.bind(this);
    }

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
        var possibleFileTypes = ["image/x-png", "image/png", "image/gif", "image/jpeg"];

        //invalid file type
        if (possibleFileTypes.findIndex(item => item === file.type) === -1) {
            this.setState({
                errorText: "Invalid file type"
            });
            return
        }
        if (this.state.errorText !== "") {
            this.setState({
                errorText: ""
            });
        }

        this.setState({
            files: [
                ...this.state.files,
                { url: URL.createObjectURL(file), name: file.name, valid: false, text: 'Processing your image...' },
            ],
            uploaded: true,
            input: file.name,
        });

        //FormData contains the image 
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        formData.append("foot", this.state.foot);
        formData.append("toe", this.state.toe);
        if (this.props.auth.isAuth) {
            //Sends a request to upload/loggedin
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
            //Sends a request to upload/notloggedin
            //It sends the temporary image name(time in Ms) to validateImage
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
        var responseText = "";
        if (this.props.auth.isAuth) {
            let imageName = this.state.files[index].name;
            await axios.get(`http://localhost:3001/diagnose/loggedin/?imageName=${imageName}`)
                .then((res) => {
                    responseText = res.data;
                })
        }
        else {
            //tempfileName = time(in milisecond) when it is uploaded
            let imageName = this.state.tempfileName;
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
        const feet = [
            { name: "Left foot", value: '0' },
            { name: "Right foot", value: '1' }
        ]
        const toes = [
            { name: "Big toe", value: '0' },
            { name: "Index toe", value: '1' },
            { name: "Middle toe", value: '2' },
            { name: "Forth toe", value: '3' },
            { name: "Little toe", value: '4' },
        ]
        return (
            <Container>
                <h3 id="DiagnosisFont">Select foot:</h3>
                {/*Foot selection*/}
                <ButtonGroup toggle className="SelectBtns">
                    {feet.map((foot, idx) => (
                        <ToggleButton
                            key={idx}
                            type="radio"
                            variant="primary"
                            name="radio"
                            value={foot.value}
                            checked={this.state.footRadioBtnValue === foot.value}
                            onChange={(e) => this.setState({ footRadioBtnValue: e.currentTarget.value, foot: e.currentTarget.value, error: "" })}
                        >
                            {foot.name}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
                <br></br>
                <br></br>

                {/*Toe selection*/}
                <h3 id="DiagnosisFont">Select toe:</h3>
                <ButtonGroup toggle className="SelectBtns">
                    {toes.map((toe, idx) => (
                        <ToggleButton
                            key={idx}
                            type="radio"
                            variant="primary"
                            name="radio"
                            value={toe.value}
                            checked={this.state.toeRadioBtnValue === toe.value}
                            onChange={(e) => this.setState({ toeRadioBtnValue: e.currentTarget.value, toe: e.currentTarget.value, error: "" })}
                        >
                            {toe.name}
                        </ToggleButton>
                    ))}
                </ButtonGroup>

                <Row>
                    <Col>
                        {/*uploadfile*/}
                        <div className="input-group">
                            <div>
                                <input
                                    type="file"
                                    className="custom-file-input"
                                    id="inputGroupFile01"
                                    aria-describedby="inputGroupFileAddon01"
                                    accept="image/x-png,image/png,image/gif,image/jpeg"
                                    onChange={this.handleUpload.bind(this)}
                                />
                                <label className="shadow p-3 mb-5 bg-dark rounded" id="UploadBtn" htmlFor={this.state.footRadioBtnValue !== -1 && this.state.toeRadioBtnValue !== -1 ? "inputGroupFile01" : ''} onClick={
                                    this.state.footRadioBtnValue === -1 && this.state.toeRadioBtnValue === -1 ? () => this.setState({error: "!Foot or toe not selected"}) : () => this.setState({error: ""})
                                }>
                                    <div>
                                        <h6 id="DiagnosisUploadBtnFONT">
                                            Upload
                                        </h6>
                                        {this.state.uploadProgress !== 0 && (
                                            <h6 id="DiagnosisUploadBtnFONT">
                                                {this.state.uploadProgress}
                                            </h6>
                                        )}
                                    </div>
                                </label>
                                <h5>{this.state.error}</h5>
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
                <div>
                    <h6>
                        {this.state.errorText}
                    </h6>
                </div>
            </Container>
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(Diagnosis);
