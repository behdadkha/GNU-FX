import React, {Component} from "react";
import {Row, Col} from "react-bootstrap";
import {connect} from "react-redux";
import Sidebar from './Sidebar';
import '../../componentsStyle/User.css';
import ApexChart from './ApexChart';
import Axios from "axios";
import {config} from "../../config";

//TODO: Change printToeData to use a map



const Dates = ["2020-09-01", "2020-10-01", "2020-11-01", "2020-12-01", "2021-01-01", "2021-02-01", "2021-03-01"];


class User extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedFoot: 0,
            selectedTreatment: 0,
            leftFootFungalCoverage: [],
            rightFootFungalCoverage : [],
            LeftFootImages : [],
            RightFootImages : [],
            leftFootDates: [],
            rightFootDates : [],
            showingDateDetails: true, //Showing details about a specific date next to the graph
            toeData: {}, //recieved from the server
            imageUrls: [], //[{imageName: "1.PNG", url : ""}]
        };
    }

    async componentDidMount() {
        //if user is not logged in, go to the login page
        if (!this.props.auth.isAuth)
            this.props.history.push("/login");

        
        await Axios.get(`${config.dev_server}/getImageNames`)
            .then(async (imageNames) => {

                //get all the user's images and store them in a data array
                for (let i = 0; i < imageNames.data.length; i++) {
                    await Axios.get(`${config.dev_server}/getImage?imageName=${imageNames.data[i]}`, { responseType: "blob" })
                        .then((image) => {
                            this.setState({
                                imageUrls: [...this.state.imageUrls, { imageName: imageNames.data[i], url: URL.createObjectURL(image.data) }]
                            });
                        });
                }

            });


        //get the user's toe data from the node server
        await Axios.get(`${config.dev_server}/getToe`)
            .then((data) => {
                this.setState({
                    toeData: data.data
                })
            });


        //organize the toeData for the graph
        //populates: 
        //          this.state.leftFootFungalCoverage, this.state.rightFootFungalCoverage
        //          this.state.LeftFootImages , this.state.RightFootImages
        this.organizeDataforGraph();

    }

    async getImageURL(imageName){
        await Axios.get(`${config.dev_server}/getImage?imageName=${imageName}`, { responseType: "blob" })
            .then((image) => {

                return URL.createObjectURL(image.data);
            });
    }

    //footNumber 0:left 1:right
    extractFootData(footNumber){
        var fungalCoverage = [[],[],[],[],[]];
        var images = [[],[],[],[],[]];
        var dates = [];

        if (this.state.toeData.feet[footNumber] !== undefined)
            for (let toe = 0; toe < this.state.toeData.feet[0].toes.length; toe++){

                for (let i = 0; i < this.state.toeData.feet[footNumber].toes[toe].images.length; i++){
                    var item = this.state.toeData.feet[footNumber].toes[toe].images[i];
                    dates.push(item.date.split("T")[0]); // dates are in this format 2020-11-21T00:00:00.000Z, split("T")[0] returns the yyyy-mm-dd
                    fungalCoverage[toe].push(item.fungalCoverage);
                    var url = this.state.imageUrls.find(({imageName}) => imageName === item.name).url;// finds the url based on the image name from the imageURLs
                    images[toe].push(url);

                    //puts nulls, so that lines in the graph can start from their actual date. print fungalCoverage to see 
                    for( let j = toe+1; j < 5; j++){
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
                LeftFootImages : leftFootData[1],
                RightFootImages : rightFootData[1],
                leftFootDates : leftFootData[2],
                rightFootDates : rightFootData[2]
            });
        }
    }

    //creates the bottom table
    printToeData(id, name, percentageData) {
        var fungalCoverage = "";

        //generating the 20% -> 10% -> 1% format for the bottom table
        for (var i = 0; i < percentageData.length - 1; i++){
            fungalCoverage += percentageData[i] + " -> ";
        }
        fungalCoverage += percentageData[i];

        return (
            <Row key={id} className="total-details-row">
                <Col className="total-details-col total-details-left-col">{name}</Col>
                <Col className="total-details-col total-details-right-col">{fungalCoverage}</Col>
            </Row>
        )
    }

    render() {;
        //console.log(this.state.leftFootFungalCoverage[1])
        //Toe data, standarized for the graph
        const leftFootData = [
            {
                name: 'Big Toe',
                data: this.state.leftFootFungalCoverage[0],
                images: this.state.LeftFootImages[0]
            },
            {
                name: 'Index Toe',
                data: this.state.leftFootFungalCoverage[1],
                images: this.state.LeftFootImages[1]
            },
            {
                name: 'Middle Toe',
                data: this.state.leftFootFungalCoverage[2],
                images: this.state.LeftFootImages[2]
            },
            {
                name: 'Fourth Toe',
                data: this.state.leftFootFungalCoverage[3],
                images: this.state.LeftFootImages[3]
            },
            {
                name: 'Little Toe',
                data: this.state.leftFootFungalCoverage[4],
                images: this.state.LeftFootImages[4]
            }
        ];
        const rightFootData = [
            {
                name: 'Big Toe',
                data: this.state.rightFootFungalCoverage[0],
                images: this.state.RightFootImages[0]
            },
            {
                name: 'Index Toe',
                data: this.state.rightFootFungalCoverage[1],
                images: this.state.RightFootImages[1]
            },
            {
                name: 'Middle Toe',
                data: this.state.rightFootFungalCoverage[2],
                images: this.state.RightFootImages[2]
            },
            {
                name: 'Fourth Toe',
                data: this.state.rightFootFungalCoverage[3],
                images: this.state.RightFootImages[3]
            },
            {
                name: 'Little Toe',
                data: this.state.rightFootFungalCoverage[4],
                images: this.state.RightFootImages[4]
            }
        ];

        var footData = (this.props.setFoot.selectedFoot === 0) ? leftFootData : rightFootData;
        var selectedfootDates = (this.props.setFoot.selectedFoot === 0) ? this.state.leftFootDates : this.state.rightFootDates;
        var footName = (this.props.setFoot.selectedFoot === 0) ? "Left" : "Right";

        //need to sort the dates to find the begining and end dates for the bottom table
        let sortedDates = [...selectedfootDates].sort();
        
        return (
            <div>
                <Sidebar {...this.props}/>
                <div className="welcome-bar">
                    <h6 className="welcome">Dashboard</h6>
                </div>
                
                <div className="main-container">
                    {/* Graph */}
                    {
                        (leftFootData[4].data) //wait for the data to be available
                            ? 
                            <ApexChart leftFootData={leftFootData} rightFootData={rightFootData}
                                leftFootDates={this.state.leftFootDates} rightFootDates={this.state.rightFootDates}
                                showingDetails={this.state.showingDateDetails}>    
                            </ApexChart>
                            :
                            ""

                    } 
                    {/*Alternate Data View bottom*/}
                    <div className="total-details-container">
                        <Row className="total-details-title">
                            {footName} Foot: {sortedDates[0] + ' -- ' + sortedDates[selectedfootDates.length-1]}
                        </Row>
                        <Row className="total-details-row total-details-title-row">
                            <Col className="total-details-col total-details-left-col">Toe Name</Col>
                            <Col className="total-details-col total-details-right-col">Fungal Coverage</Col>
                        </Row>
                        {
                            (footData[4].data) ? footData.map(({name, data}, id) => this.printToeData(id, name, data.filter(item => item !== null))) : ""
                        }
                        <Row className="total-details-row total-details-bottom-row"></Row>
                    </div>
                </div>
            </div >
        );
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    setFoot: state.setFoot
});

export default connect(mapStateToProps)(User);
