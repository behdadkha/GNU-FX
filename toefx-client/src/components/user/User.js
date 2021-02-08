/*
    A class for displaying the user's home dashboard.
*/

import React, { Component } from "react";
import { Row, Table } from "react-bootstrap";
import { connect } from "react-redux";
//import Axios from "axios";

//import { config } from "../../config";
import { GetFootName, GetToeName, GetImageSrcByURLsAndName, LEFT_FOOT_ID, RIGHT_FOOT_ID, TOE_COUNT } from "../../Utils";
import store from "../../Redux/store";
import { getAndSaveImages, getAndSaveToeData } from "../../Redux/Actions/setFootAction";
import ApexChart from './ApexChart';
import Sidebar from './Sidebar';

import '../../componentsStyle/User.css';

//TODO: Display when user has no images on their account (probably something like "Upload image to get started!")
//      Should also then change way of determining if no data is loaded yet.


class User extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            selectedFoot: 0, //0 if the user is viewing the left foot, 1 for right foot
            selectedTreatment: 0, //Point on graph user selected to view
            rightFootData: [],
            leftFootData: [],
            leftFootDates: [], //Dates images were taken of toes on the left foot
            rightFootDates: [], //Dates images were taken of toes on the right foot
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
        //Redirect to login page if user not logged in
        try {

            if (!this.props.auth.isAuth) {
                this.props.history.push("/login");
                return
            }
            //Redux data gets erased after a refresh, so if the data is gone we need to get it again
            if (this.props.foot.images.length === 0) {
                try{
                    await store.dispatch(getAndSaveImages()); //Load image URLs
                    await store.dispatch(getAndSaveToeData());//Load toe data
                }catch{
                    console.log("not working");
                }
                
            }

            this.setState({
                imageUrls: this.props.foot.images,
                toeData: this.props.foot.toeData
            },
                this.organizeDataforGraph //Only call once date is saved to state
            );
        } catch {
            console.log("Couldn't get the required data");
        }

    }

    /*
        Processes the date received from the server, and splits it into categories.
        param footId: 0 for left foot, 1 for right foot.
        returns: Object containing
                    images: An array of URLs to each image
                    dates: Dates each image was uploaded
                    fungalCoverage: An of fungal coverage in percent of each image
    */
    processServerFeetData(footId) {
        var images = [[], [], [], [], []]; //One slot for each toe (5 toes)
        var fungalCoverage = [[], [], [], [], []];
        var dates = [];

        if (this.state.toeData.feet !== undefined && this.state.toeData.feet[footId] !== undefined) { //Error handling
            for (let toeId = 0; toeId < this.state.toeData.feet[footId].toes.length; ++toeId) { //Each toe
                let toe = this.state.toeData.feet[footId].toes[toeId];

                for (let image of toe.images) { //Each of image of the toe
                    let imageURL
                    if (this.state.imageUrls)
                        imageURL = GetImageSrcByURLsAndName(this.state.imageUrls, image.name); //Finds the URL based on the image name and URLs loaded

                    let date = image.date.split("T")[0] //Format: 2020-11-21T00:00:00.000Z, split("T")[0] returns the yyyy-mm-dd

                    images[toeId].push(imageURL);
                    fungalCoverage[toeId].push(image.fungalCoverage);
                    dates.push(date);
                    //Add blank entries to future toes so that lines in the graph can start from their actual date.
                    //ApexChart must take in a single dimension array, so dates have to be stored in order.
                    //Looks like:
                    //Toe 0: [80%,    75%,    60%]
                    //Toe 1: [null,   null,   null,   90%,    80%,    70%]
                    //Dates: [Date 1, Date 2, Date 3, Date 1, Date 2, Date 3]
                    for (let j = toeId + 1; j < this.state.toeData.feet[footId].toes.length; ++j)
                        fungalCoverage[j].push(null);
                }
            }
        }

        return {
            images: images,
            dates: dates,
            fungalCoverage: fungalCoverage
        };
    }

    /* 
        Organize the toe data for the graph.
        The data recieved from the server has format: feet: [{toes: [{images:[]}]}] so we need to change it for the graph
    */
    organizeDataforGraph() {
        if (this.state.toeData.feet !== undefined && (this.state.leftFootData.length === 0 || this.state.rightFootData.length === 0)) {
            //Seperate the fungal coverage and images (required for the Apexchart)
            var allLeftFootData = this.processServerFeetData(LEFT_FOOT_ID);
            var allRightFootData = this.processServerFeetData(RIGHT_FOOT_ID);

            //Toe data standarized for the graph
            var leftFootData = [];
            var rightFootData = [];

            for (let i = 0; i < TOE_COUNT; ++i) {
                leftFootData.push(
                    {
                        name: GetToeName(i),
                        data: allLeftFootData.fungalCoverage[i],
                        images: allLeftFootData.images[i]
                    });

                rightFootData.push(
                    {
                        name: GetToeName(i),
                        data: allRightFootData.fungalCoverage[i],
                        images: allRightFootData.images[i]
                    });
            }

            this.setState({
                leftFootData: leftFootData,
                rightFootData: rightFootData,
                leftFootDates: allLeftFootData.dates,
                rightFootDates: allRightFootData.dates,
                dataLoaded: true
            });
        }
    }

    /*
        Prints the rows in the bottom table. Each row shows progress over time of
        fungal percentage increase/decrease.
        param id: The list id for react.
        param name: The toe's name.
        param percentageData: The fungal coverage percentages for the toe over time.
    */
    printToeData(id, name, percentageData) {
        var fungalCoverage = "";

        if (percentageData.length === 0) {
            fungalCoverage = "No Data"
        }
        else {
            //Generates the 20% -> 10% -> 1% format for the bottom table
            for (var i = 0; i < percentageData.length - 1; ++i)
                fungalCoverage += percentageData[i] + " -> ";

            fungalCoverage += percentageData[i];
        }

        return (
            <tr key={id}>
                <td className="total-details-left-col">{name}</td>
                <td>{fungalCoverage}</td>
            </tr>
        )
    }

    /*
        Prints the user's dashboard.
    */
    render() {
        var footName = GetFootName(this.props.foot.selectedFoot);
        var footData = (this.props.foot.selectedFoot === LEFT_FOOT_ID) ? this.state.leftFootData : this.state.rightFootData;
        var selectedfootDates = (this.props.foot.selectedFoot === LEFT_FOOT_ID) ? this.state.leftFootDates : this.state.rightFootDates;

        let dateRange;
        let sortedDates = [...selectedfootDates].sort(); //Need to sort the dates to find the begining and end dates for the bottom table
        if (selectedfootDates.length === 0) //User hasn't uploaded images so give instructions how to start
            dateRange = <h4 className="no-uploaded-images-title">"Press the "Upload Image" button located in top left corner to get started."</h4>;
        else
            dateRange = sortedDates[0] + ' -- ' + sortedDates[selectedfootDates.length - 1];

        if (this.state.dataLoaded) { //The data is ready to be displayed
            return (
                <div className="page">
                    <Sidebar {...this.props} />

                    <div className="main-container">
                        <div className="welcome-bar">
                            <h6 className="welcome">Dashboard</h6>
                        </div>

                        <div test-id="shownDataUser" className="sub-container user-sub-container">
                            {/* Graph */}
                            {
                                <ApexChart leftFootData={this.state.leftFootData} rightFootData={this.state.rightFootData}
                                    leftFootDates={this.state.leftFootDates} rightFootDates={this.state.rightFootDates}>
                                </ApexChart>
                            }

                            {/*Alternate Data View bottom*/}
                            <div className="total-details-container">
                                <Row className="total-details-title">
                                    {footName} Foot: {dateRange}
                                </Row>
                                <Table striped bordered size="md" className="total-details-table">
                                    <thead>
                                        <tr>
                                            <th className="total-details-left-col">Toe Name</th>
                                            <th>Fungal Coverage Change</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            footData.map(({ name, data }, id) =>
                                                this.printToeData(id, name, data.filter(item => item !== null)))
                                        }
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div >
            );
        }
        else { //If data isn't loaded, display "Loading..." to the user
            return (
                <div>
                    <Sidebar {...this.props} />
                    <div className="main-container">
                        <div className="welcome-bar">
                            <h6 className="welcome">Dashboard</h6>
                        </div>

                        <div className="sub-container user-sub-container">
                            <h4 test-id="loading" className="dashboard-loading">Loading...</h4>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    foot: state.foot,
});

export default connect(mapStateToProps)(User);
