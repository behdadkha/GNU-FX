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


class NewUser extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedFoot: 0,
            selectedTreatment: 0,
            leftFootFungalCoverage: [],
            rightFootFungalCoverage : [],
            LeftFootImages : [],
            showingDateDetails: true, //Showing details about a specific date next to the graph
            toeData: {}, //recieved from the server
            imageUrls: [], //[{imageName: "1.PNG", url : }]
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

    }

    async getImageURL(imageName){
        await Axios.get(`${config.dev_server}/getImage?imageName=${imageName}`, { responseType: "blob" })
            .then((image) => {

                return URL.createObjectURL(image.data);
                /*this.setState({
                    imageUrls: [...this.state.imageUrls, { imageName: imageNames.data[i], url: URL.createObjectURL(image.data) }]
                });*/
            });
    }

    organizeDataforGraph(){
        if (this.state.toeData.feet !== undefined && this.state.leftFootFungalCoverage.length === 0) {
            var LeftfungalCoverage = [[],[],[],[],[]]; // need to organize data for ApexChart
            var RightfungalCoverage = [[],[],[],[],[]];
            var LeftImages = [[],[],[],[],[]];
            var RightImages = [[],[],[],[],[]];

            //left foot
            if (this.state.toeData.feet[0] !== undefined)
                for (let toe = 0; toe < this.state.toeData.feet[0].toes.length; toe++){
                    this.state.toeData.feet[0].toes[toe].images.map(item => 
                        {
                            LeftfungalCoverage[toe].push(item.fungalCoverage);
                            var url = this.state.imageUrls.find(({imageName}) => imageName === item.name).url;
                            LeftImages[toe].push(url);
                        });
                }

            //right foot
            if (this.state.toeData.feet[1] !== undefined)
                for (let toe = 0; toe < this.state.toeData.feet[1].toes.length; toe++){
                    this.state.toeData.feet[1].toes[toe].images.map(item => RightfungalCoverage[toe].push(item.fungalCoverage));
                }


            //console.log(LeftfungalCoverage);
            this.setState({ 
                leftFootFungalCoverage : LeftfungalCoverage,
                rightFootFungalCoverage: RightfungalCoverage,
                LeftFootImages : LeftImages
            });
        }
    }

    
    printToeData(id, name, percentageData) {
        return (
            <Row key={id} className="total-details-row">
                <Col className="total-details-col total-details-left-col">{name}</Col>
                <Col className="total-details-col total-details-right-col">{percentageData[0]}% -{'>'} {percentageData[1]}% -{'>'} {percentageData[2]}% -{'>'} {percentageData[3]}% -{'>'} {percentageData[4]}% -{'>'} {percentageData[5]}%</Col>
            </Row>
        )
    }

    render() {

        //organize the toeData for the graph
        this.organizeDataforGraph();
        
        /*let toeImages = [];
        if(this.state.LeftFootImages[0]){
            console.log(this.state.LeftFootImages[0]);
            console.log(this.state.imageUrls.find(({imageName}) => imageName === this.state.LeftFootImages[0][0]));
            for (let i = 0; i < this.state.LeftFootImages[0].length; i++){
                bigToeImages.push(this.state.imageUrls.find(({imageName}) => imageName === this.state.LeftFootImages[0][i]))
            }
        }*/

        //console.log(this.state.LeftFootImages);

        //Toe data, standarized for the graph
        const Data = [
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

        var footData = (this.state.selectedToe === 0) ? Data : Data; //Eventually should choose correct data
        var footName = (this.state.selectedFoot === 0) ? "Left" : "Right";

        return (
            <div>
                <Sidebar {...this.props}/>
                <div className="welcome-bar">
                    <h6 className="welcome">Dashboard</h6>
                </div>

                <div className="main-container">
                    {/* Graph */}
                    {
                        (Data[4].data) //wait for the data to be available
                            ? 
                            <ApexChart leftFootData={Data} rightFootData={Data}
                                leftFootDates={Dates} rightFootDates={Dates}
                                showingDetails={this.state.showingDateDetails}>    
                            </ApexChart>
                            :
                            ""

                    } 
                    {/*Alternate Data View*/}
                    <div className="total-details-container">
                        <Row className="total-details-title">
                            {footName} Foot: {Dates[0]} - {Dates[Dates.length - 1]}
                        </Row>
                        <Row className="total-details-row total-details-title-row">
                            <Col className="total-details-col total-details-left-col">Toe Name</Col>
                            <Col className="total-details-col total-details-right-col">Fungal Coverage</Col>
                        </Row>
                        {
                            (footData.Data) ? footData.map(({id, name, data}) => this.printToeData(id, name, data)) : ""
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
});

export default connect(mapStateToProps)(NewUser);
