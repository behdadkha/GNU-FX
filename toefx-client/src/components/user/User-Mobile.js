/*
    A class for displaying the user's home dashboard on mobile devices.
*/

import React, { Component } from "react";
import { Container, Row, Col, Dropdown, Button } from "react-bootstrap";
import { connect } from "react-redux";
//import Axios from "axios";

//import { config } from "../../config";
import { GetFootSymbolByActive, GetToeSymbolImage, GetImageURLByName, LEFT_FOOT_ID, RIGHT_FOOT_ID, TOE_COUNT } from "../../Utils";
import store from "../../Redux/store";
import { getAndSaveImages, getAndSaveToeData } from "../../Redux/Actions/setFootAction";
import Sidebar from './Sidebar';

import '../../componentsStyle/User-Mobile.css';

//TODO: Use NavBar instead of Sidebar

class User extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            selectedFoot: 0, //0 if the user is viewing the left foot, 1 for right foot
            selectedToe: 0,
            toeData: {}, //Data recieved from the server
            imageUrls: [], //List of data like: {imageName: "1.PNG", url : ""}
            dataLoaded: false, //Used for showing the loading screen until all data are loaded
        };
    }

    /*
        Logs the user out if they're not logged in.
        Otherwise loads the user's data from the server.
    */
   async componentDidMount() {
        try {
            //Redirect to login page if user not logged in
            if (!this.props.auth.isAuth) {
                this.props.history.push("/login");
                return;
            }

            //Redux data gets erased after a refresh, so if the data is gone we need to get it again
            if (this.props.foot.images.length === 0) {
                try {
                    await store.dispatch(getAndSaveImages()); //Load image URLs
                    await store.dispatch(getAndSaveToeData());//Load toe data
                }
                catch {
                    console.log("Error: Could not retrieve images from the server.");
                }
            }

            this.setState({
                imageUrls: this.props.foot.images,
                toeData: this.props.foot.toeData,
                dataLoaded: true, //Either show the images or display a single upload button
            });
        }
        catch (e) {
            console.log("An error ocurred while trying to retrieve images from the server.");
        }
    }

    /*
        Shows images for a certain foot when selected.
        param footId: The foot to show.
    */
    viewFoot(footId) {
        if (footId === this.state.selectedFoot)
            return; //Don't do anything if foot is already selected

        this.setState({
            selectedFoot: footId,
        });
    }

    /*
        Shows images for a certain toe when selected.
        param footId: The toe to show.
    */
    viewToe(toeId) {
        if (toeId === this.state.selectedToe)
            return; //Don't do anything if toe is already selected

        this.setState({
            selectedToe: toeId,
        });
    }

    /*
        Redirects the user to the upload page.
    */
    gotoUploadPage() {
        this.props.history.push("/upload");
        window.location.reload(); //Refreshes the nav bar
    }

    /*
        Calculates the correct colour for the infection bar.
        param percent: The percentage of the toe's infection out of 100.
        returns: A hex string corresponding to the colour of the infection bar.
    */
    calculateInfectionColour(percent) {
        var r, g, b = 0;
        var divisor = 0;

        if (percent < 21) { //0% - 20%: Green - Yellow
            divisor = 21; //Comprises 20% of values
            g = 255;
            r = (255 / divisor) * percent; //How yellow it is
        }
        else if (percent < 71) { //21% - 70% Yellow - Red 
            divisor = 1 - ((percent - 20) / 100) / 0.5; //Comprises 50% of values
            r = 255;
            g = 255 * divisor; //How yellow it is
        }
        else { //71% - 100% - Red - Dark Red
            divisor = (100 - percent) / 30;
            r = 255 - (100 * (1 - divisor)); //155 - 255
            g = 0;
        }

        r = Math.round((Math.min(r, 255)));
        g = Math.round((Math.min(g, 255)));

        var h = r * 0x10000 + g * 0x100 + b * 0x1;
        return "#" + ("000000" + h.toString(16)).slice(-6);
    }

    /*
        Prints the dropdown list the user can use to select which toe to view.
    */
    printToeDropdownButton() {
        var items = [];

        //The list is comprised of a multiple images representing toes that can be viewed
        for (let i = 0; i < TOE_COUNT; ++i) {
            items.push(
                <Dropdown.Item as="button" active={i === this.state.selectedToe} className="toe-dropdown-button">
                    <div className="toe-dropdown-item" onClick={this.viewToe.bind(this, i)}>
                    <span className="toe-dropdown-image">{GetToeSymbolImage(this.state.selectedFoot, i)}</span>
                    </div>
                </Dropdown.Item>
            )
        }

        return (
            <Dropdown className="dropdown-toggle">
                <Dropdown.Toggle variant="primary" id="dropdown-item-button"> {/*Variant changes the colour*/}
                    <span className="toe-dropdown-image">{GetToeSymbolImage(this.state.selectedFoot, this.state.selectedToe)}</span> {/*Show current toe selected*/}
                </Dropdown.Toggle>

                <Dropdown.Menu className="toe-dropdown-menu">
                    {items}
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    /*
        Prints the date an image was taken.
        param dateString: The date extracted from the database for the image.
    */
    printToeDate(dateString) {
        var date = new Date(dateString.split("T")[0]);
        var day = date.getDay()
        var month = date.toLocaleString('default', { month: 'long' });
        var year = date.getFullYear()

        return (
            <div className="mobile-image-date">
                <div className="mobile-image-day-month">{day} {month}</div>
                <div className="mobile-image-year">{year}</div>
            </div>
        )
    }

    /*
        Prints the list of toes the user previously uploaded along with date taken and coverage information.
    */
    printToes() {
        var rows = []

        if (this.state.dataLoaded) { //Wait until data is loaded from the server
            var toeData = this.state.toeData["feet"][this.state.selectedFoot]["toes"][this.state.selectedToe]["images"];

            for (let i = toeData.length - 1; i >= 0; --i) { //Go in reverse so newest picture comes first
                //Coverage is either red or green depending on the condision
                let infectedText = toeData[i]["fungalCoverage"] === "0%" ? "Healthy" : toeData[i]["fungalCoverage"] + " Infected";
                let infectedColour = toeData[i]["fungalCoverage"] === "0%" ? "healthy-text" : "infected-text";

                rows.push(
                    <Row className="mobile-image-row">
                        <div className="mobile-image-row-container">
                            {/*Print the date above*/}
                            {this.printToeDate(toeData[i]["date"])}

                            <img src={GetImageURLByName(this.state.imageUrls, toeData[i]["name"])} alt="Loading..." className="mobile-image"></img>
    
                            {/*Display coverage as a bar that fills in along the bottom of the image*/}
                            <div className="mobile-coverage">
                                <span className={infectedColour}>
                                    {infectedText}
                                </span>

                                <div className="mobile-coverage-bar">
                                    <div className="infected-bar"
                                    style={{width: toeData[i]["fungalCoverage"],
                                            backgroundColor: this.calculateInfectionColour(parseInt(toeData[i]["fungalCoverage"].split("%")[0]))}}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </Row>
                )
            }
        }

        return rows;
    }

    /*
        Prints the user's mobile dashboard.
    */
    render() {
        var defaultFootButtonClass = "mobile-foot-button";
        var leftFootSymbol = GetFootSymbolByActive(LEFT_FOOT_ID, this.state.selectedFoot);
        var rightFootSymbol = GetFootSymbolByActive(RIGHT_FOOT_ID, this.state.selectedFoot);

        if (!this.state.dataLoaded) //If data isn't loaded, display "Loading..." to the user
        {
            return (
                <div>
                    <Sidebar {...this.props} className="mobile-header"/>
                    <h4 className="dashboard-loading">Loading...</h4>
                </div>
            );
        }

        return (
            <div>
                <Sidebar {...this.props} className="mobile-header"/>
                <Container className="mobile-image-page-container">
                    {/* Buttons to change which foot is being viewed */}
                    <Row className="mobile-image-button-row">
                        <Col className="remove-padding">
                            <Button onClick={this.viewFoot.bind(this, LEFT_FOOT_ID)}
                                    className={defaultFootButtonClass}>
                                <img src={leftFootSymbol} className="mobile-foot-button-logo" alt="Left Foot"/>
                            </Button>
                        </Col>

                        <Col className="remove-padding" style={{flexGrow: "2"}}>
                            {this.printToeDropdownButton()}
                        </Col>

                        <Col className="remove-padding">
                            <Button onClick={this.viewFoot.bind(this, RIGHT_FOOT_ID)}
                                    className={defaultFootButtonClass}>
                                <img src={rightFootSymbol} className="mobile-foot-button-logo" alt="Right Foot"/>
                            </Button>
                        </Col>
                    </Row>

                    <Row className="mobile-image-upload-button-row">
                        <Button onClick={() => this.gotoUploadPage()} className="mobile-image-upload-button">
                            Upload New Toes
                        </Button>
                    </Row>

                    {this.printToes()}
                </Container>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    foot: state.foot,
});

export default connect(mapStateToProps)(User);
