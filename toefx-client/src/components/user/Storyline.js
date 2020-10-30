import React, {Component} from "react";
import {Button, Carousel, Col, Container, Row} from "react-bootstrap";
import {connect} from "react-redux";
import axios from "axios";

class Storyline extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: "Choose",
            uploaded: false,
            files: [], //currently uploaded files
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
                {url: URL.createObjectURL(file), name: file.name},
            ],
            uploaded: true,
            input: file.name,
        });

        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        axios.post("http://localhost:3001/upload", formData, {
                onUploadProgress: (ProgressEvent) => {
                    let progress = Math.round((ProgressEvent.loaded / ProgressEvent.total) * 100) + "%";
                    this.setState({uploadProgress: progress});
                },
            })
            .then((res) => {
                console.log(res);
            });
    }

    render() {
        //populate the slideShow when files are uploaded
        let slideShow;

        return (
            <Container>
                <Row>
                    <Col>
                        {/*uploadfile*/}
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <span className="input-group-text" id="inputGroupFileAddon01">
                                    Upload
                                </span>
                            </div>
                            <div className="custom-file">
                                <input
                                    type="file"
                                    className="custom-file-input"
                                    id="inputGroupFile01"
                                    aria-describedby="inputGroupFileAddon01"
                                    onChange={this.handleUpload.bind(this)}
                                />
                                <label className="custom-file-label" htmlFor="inputGroupFile01" >
                                    <div>
                                        <h6 style={{display: "inline"}}>
                                            {this.state.input}
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
                    {/*this.state.files.map((source, index) => 
                        <Col key={`col-${index}`}>
                            <Row>
                                <Col>
                                    <img key={index} id="images" src={source.url}/>
                                </Col>
                            </Row>
                        </Col>)
                    */}
                    <Col>
                        <Carousel
                            style={{
                                width: "50%",
                                margin: "auto",
                                paddingTop: "4%",
                            }}
                        >
                            {this.state.files.map((source, index) => (
                                <Carousel.Item>
                                    <img
                                        className="d-block w-100"
                                        style={{width: "100%"}}
                                        src={source.url}
                                        alt="Slides"
                                    />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </Col>
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(Storyline);
