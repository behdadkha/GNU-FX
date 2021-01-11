/*
    A class for displaying the user's home dashboard.
*/

import React, {Component} from "react";
import {Row, Table} from "react-bootstrap";
import {connect} from "react-redux";
import Axios from "axios";

import {config} from "../../config";
import {GetFootName, GetToeName, GetImageSrcByURLsAndName, LEFT_FOOT_ID, RIGHT_FOOT_ID, TOE_COUNT} from "../../Utils";
import store from "../../Redux/store";
import {getAndSaveImages} from "../../Redux/Actions/setFootAction";
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
            leftFootImages : [], //Images of toes on the left foot
            rightFootImages : [], //Images of toes on the right foot
            leftFootDates: [], //Dates images were taken of toes on the left foot
            rightFootDates : [], //Dates images were taken of toes on the right foot
            leftFootFungalCoverage: [], //Fungal coverage percent of the images of toes on the left foot
            rightFootFungalCoverage : [], //Fungal coverage percent of the images of toes on the right foot
            toeData: {}, //Data recieved from the server
            imageUrls: [], //List of data like: {imageName: "1.PNG", url : ""}
        };
    }

    /*
        Logs the user out if they're not logged in.
        Otherwise loads the user's data from the server.
    */
    async componentDidMount() {
        //Redirect to login page if user not logged in
        if (!this.props.auth.isAuth)
            this.props.history.push("/login");

        //Load the images from the server
        await Axios.get(`${config.dev_server}/getImageNames`)
            .then(async (imageNames) => {
                //Get all the user's images and store them in a data array
                for (let i = 0; i < imageNames.data.length; ++i) {
                    await Axios.get(`${config.dev_server}/getImage?imageName=${imageNames.data[i]}`, { responseType: "blob" })
                        .then((image) => {
                            this.setState({
                                imageUrls: [...this.state.imageUrls,
                                            {
                                                imageName: imageNames.data[i],
                                                url: URL.createObjectURL(image.data)
                                            }]
                            });
                        });
                }
            });

        //Redux data gets erased after a refresh, so if the data is gone we need to get it again
        if (this.props.foot.images.length === 0) {
            await store.dispatch(getAndSaveImages());
            this.setState({
                imageUrls : this.props.foot.images
            });
        }
        else {
            this.setState({
                imageUrls : this.props.foot.images
            });
        }

        //Get the user's toe data from the node server
        await Axios.get(`${config.dev_server}/getToe`)
            .then((data) => {
                this.setState({
                    toeData: data.data
                })
            });

        //Organize the toe data for the graph
        //Populates:
        //  this.state.leftFootImages, this.state.rightFootImages
        //  this.state.leftFootFungalCoverage, this.state.rightFootFungalCoverage
        //  this.state.leftFootDates, this.state.rightFootDates
        this.organizeDataforGraph();
    }

    /*
        Converts an image name into its corresponding URL for access.
        param imageName: The name of the image to get the URL for.
        returns: The URL for the image given.
    */
    async getImageURL(imageName) {
        await Axios.get(`${config.dev_server}/getImage?imageName=${imageName}`, { responseType: "blob" })
            .then((image) => {
                return URL.createObjectURL(image.data);
            });
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

        if (this.state.toeData.feet[footId] !== undefined) { //Error handling
            for (let toeId = 0; toeId < this.state.toeData.feet[footId].toes.length; ++toeId) { //Each toe
                let toe = this.state.toeData.feet[footId].toes[toeId];

                for (let image of toe.images) { //Each of image of the toe
                    let imageURL = GetImageSrcByURLsAndName(this.state.imageUrls, image.name); //Finds the URL based on the image name and URLs loaded
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
            fungalCoverage: fungalCoverage,  
        };
    }

    organizeDataforGraph() {
        if (this.state.toeData.feet !== undefined && this.state.leftFootFungalCoverage.length === 0) { 
            //separate the fungal coverage and images (required for the Apexchart)
            //left foot == 0
            var leftFootData = this.processServerFeetData(LEFT_FOOT_ID);
            //right foot == 1
            var rightFootData = this.processServerFeetData(RIGHT_FOOT_ID);

            this.setState({ 
                leftFootFungalCoverage: leftFootData.fungalCoverage,
                rightFootFungalCoverage: rightFootData.fungalCoverage,
                leftFootImages: leftFootData.images,
                rightFootImages: rightFootData.images,
                leftFootDates: leftFootData.dates,
                rightFootDates: rightFootData.dates
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

        //Generates the 20% -> 10% -> 1% format for the bottom table
        for (var i = 0; i < percentageData.length - 1; ++i)
            fungalCoverage += percentageData[i] + " -> ";

        fungalCoverage += percentageData[i];

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
        //Toe data, standarized for the graph
        var leftFootData = [];
        var rightFootData = [];

        for (let i = 0; i < TOE_COUNT; ++i)
        {
            leftFootData.push(
            {
                name: GetToeName(i),
                data: this.state.leftFootFungalCoverage[i],
                images: this.state.leftFootImages[i],
            });

            rightFootData.push(
            {
                name: GetToeName(i),
                data: this.state.rightFootFungalCoverage[i],
                images: this.state.rightFootImages[i],
            });
        }

        var footName = GetFootName(this.props.foot.selectedFoot);
        var footData = (this.props.foot.selectedFoot === LEFT_FOOT_ID) ? leftFootData : rightFootData;
        var selectedfootDates = (this.props.foot.selectedFoot === LEFT_FOOT_ID) ? this.state.leftFootDates : this.state.rightFootDates;

        //Need to sort the dates to find the begining and end dates for the bottom table
        let sortedDates = [...selectedfootDates].sort();
        let pageLoaded = sortedDates[0] != null;

        if (pageLoaded) { //The data is ready to be displayed
            return (
                <div>
                    <Sidebar {...this.props}/>
                    
                    <div className="main-container">
                        {/* Graph */}
                        {
                            <ApexChart leftFootData={leftFootData} rightFootData={rightFootData}
                                leftFootDates={this.state.leftFootDates} rightFootDates={this.state.rightFootDates}>    
                            </ApexChart>
                        }

                        {/*Alternate Data View bottom*/}
                        <div className="total-details-container">
                            <Row className="total-details-title">
                                {footName} Foot: {sortedDates[0] + ' -- ' + sortedDates[selectedfootDates.length - 1]}
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
                                    footData.map(({name, data}, id) =>
                                        this.printToeData(id, name, data.filter(item => item !== null)))
                                }
                                </tbody>  
                            </Table>
                        </div>
                    </div>
                </div >
            );
        }
        else { //If data isn't loaded, display "Loading..." to the user
            return (
                <div>
                    <Sidebar {...this.props}/>

                    <h4 className="dashboard-loading">Loading...</h4>
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
