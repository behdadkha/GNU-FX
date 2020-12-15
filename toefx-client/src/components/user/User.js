import React, {Component} from "react";
import {Row, Col} from "react-bootstrap";
import {connect} from "react-redux";
import Sidebar from './Sidebar';
import '../../componentsStyle/User.css';
import ApexChart from './ApexChart';
import Axios from "axios";
import {config} from "../../config";

//TODO: Change printToeData to use a map

//Temp data
const Data = [
    {
        name: 'Big Toe',
        data: [100, 42, 51, 28, 40, 31, 9]
    },
    {
        name: 'Index Toe',
        data: [100, 50, 40, 60, 40, 10, 1]
    },
    {
        name: 'Middle Toe',
        data: [70, 65, 60, 55, 20, 30, 15]
    },
    {
        name: 'Fourth Toe',
        data: [15, 30, 50, 65, 1, 5, 0]
    },
    {
        name: 'Little Toe',
        data: [40, 45, 50, 55, 60, 65, 15]
    }
];

const Dates = ["2020-09-01", "2020-10-01", "2020-11-01", "2020-12-01", "2021-01-01", "2021-02-01", "2021-03-01"];


class NewUser extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedFoot: 0,
            selectedTreatment: 0,
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
        Axios.get(`${config.dev_server}/getToe`)
            .then((data) => {
                this.setState({
                    toeData: data.data
                })
            });
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
                    <ApexChart leftFootData={Data} rightFootData={Data}
                            leftFootDates={Dates} rightFootDates={Dates}
                            showingDetails={this.state.showingDateDetails}></ApexChart>
                    
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
                            footData.map(({id, name, data}) => this.printToeData(id, name, data))
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
