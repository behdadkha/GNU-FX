import React, {Component} from "react";
import {Row, Table} from "react-bootstrap";
import {connect} from "react-redux";
import Axios from "axios";

import {config} from "../../config";
import { GetFootName, GetToeName, GetToeCount, GetImageSrcByURLsAndName } from "../../Utils";
import store from "../../Redux/store";
import { getAndSaveImages } from "../../Redux/Actions/setFootAction";
import ApexChart from './ApexChart';
import Sidebar from './Sidebar';

import '../../componentsStyle/User.css';

//TODO: Display when user has no images on their account (probably something like "Upload image to get started!")


class User extends Component {
    /*
        Sets base data for the page.
    */
    constructor(props) {
        super(props);

        this.state = {
            selectedFoot: 0, //0 if the user is viewing the left foot, 1 for right foot
            selectedTreatment: 0, //Point on graph user selected to view
            leftFootImages : [],
            rightFootImages : [],
            leftFootDates: [],
            rightFootDates : [],
            leftFootFungalCoverage: [],
            rightFootFungalCoverage : [],
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


        //organize the toeData for the graph
        //populates:
        //          this.state.LeftFootImages, this.state.RightFootImages
        //          this.state.leftFootFungalCoverage, this.state.rightFootFungalCoverage
        this.organizeDataforGraph();
    }

    async getImageURL(imageName){
        await Axios.get(`${config.dev_server}/getImage?imageName=${imageName}`, { responseType: "blob" })
            .then((image) => {
                return URL.createObjectURL(image.data);
            });
    }

    
    //from the toedata recieved from the backend
    //it creates an array for fungalcoverage, images and dates to be shown on the graph
    //footNumber 0:left 1:right
    extractFootData(footNumber){
        var fungalCoverage = [[],[],[],[],[]];
        var images = [[],[],[],[],[]];
        var dates = [];

        if (this.state.toeData.feet[footNumber] !== undefined) {
            for (let toe = 0; toe < this.state.toeData.feet[0].toes.length; toe++){

                for (let i = 0; i < this.state.toeData.feet[footNumber].toes[toe].images.length; i++){
                    let item = this.state.toeData.feet[footNumber].toes[toe].images[i];

                    dates.push(item.date.split("T")[0]); // dates are in this format 2020-11-21T00:00:00.000Z, split("T")[0] returns the yyyy-mm-dd
                    fungalCoverage[toe].push(item.fungalCoverage);
                    var url = GetImageSrcByURLsAndName(this.state.imageUrls, item.name);// finds the url based on the image name from the imageURLs
                    images[toe].push(url);

                    //puts nulls, so that lines in the graph can start from their actual date. print fungalCoverage to see 
                    for( let j = toe + 1; j < GetToeCount(); ++j)
                        fungalCoverage[j].push(null);
                }
                
            }
        }

        return [fungalCoverage, images, dates];
    }

    organizeDataforGraph(){
        if (this.state.toeData.feet !== undefined && this.state.leftFootFungalCoverage.length === 0) { 
            //separate the fungal coverage and images (required for the Apexchart)
            //left foot == 0
            var leftFootData = this.extractFootData(0);
            //right foot == 1
            var rightFootData = this.extractFootData(1);

            this.setState({ 
                leftFootFungalCoverage : leftFootData[0],
                rightFootFungalCoverage: rightFootData[0],
                leftFootImages : leftFootData[1],
                rightFootImages : rightFootData[1],
                leftFootDates : leftFootData[2],
                rightFootDates : rightFootData[2]
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

    render() {;
        //Toe data, standarized for the graph
        var leftFootData = [];
        var rightFootData = [];

        for (let i = 0; i < GetToeCount(); ++i)
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
        var footData = (this.props.foot.selectedFoot === 0) ? leftFootData : rightFootData;
        var selectedfootDates = (this.props.foot.selectedFoot === 0) ? this.state.leftFootDates : this.state.rightFootDates;

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
