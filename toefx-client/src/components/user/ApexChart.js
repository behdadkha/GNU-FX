/*
    Class for the chart that appears showing patient treatment improvement.
*/

import React from "react";
import ReactApexChart from "react-apexcharts"
import { Row, Table } from "react-bootstrap";

import {
    GetFootName, GetToeName, GetDesktopFeetButtons,
    LEFT_FOOT_ID, /*RIGHT_FOOT_ID,*/ TOE_COUNT
} from "../../Utils";
import store from "../../Redux/store";
import { setSelectedFoot } from "../../Redux/Actions/setFootAction";

import '../../componentsStyle/ApexChart.css';
import leftFootCroppedLogo from '../../icons/leftfootCropped.png';
import rightFootCroppedLogo from '../../icons/rightfootCropped.png';
//BUG: Clicking on bottom labels changes graph view but not selected buttons

const gInitialToeSelection = [true, true, false, false, false]; //Only first two toes start off shown (client request)


class ApexChart extends React.Component {
    /*
        Sets base data for the chart.
    */
    constructor(props) {
        super(props);

        //Initially data for the left foot is shown, so set up the graph to show it
        this.state = {
            treatmentIndex: 0, //User clicks on a point in the graph, this represents the clicked index
            selectedFootIndex: LEFT_FOOT_ID, //Start off showing the left foot
            shownToes: gInitialToeSelection, //Initially only show certain toes
            showingDetails: this.props.showingDetails, //Viewing details about a specific data point
            series: this.props.leftFootData,
            options: {
                chart: {
                    height: 350,
                    type: "area",
                    events: {
                        click: (event, chartContext, config) => {
                            /*config.seriesIndex: Number of big toe, index toe, etc. starting from 0
                              config.dataPointIndex: Number of treatment date*/
                            if (config.dataPointIndex >= 0)
                                this.setState({ treatmentIndex: config.dataPointIndex, showingDetails: true })
                        }
                    }
                },
                dataLabels: {
                    enabled: true
                },
                stroke: {
                    curve: "straight"
                },
                xaxis: {
                    type: "datetime",
                    categories: this.props.leftFootDates,
                    show: true,
                },
                yaxis: {
                    min: 0,
                    max: 100,
                    title: {
                        text: "Fungual Coverage (%)",
                        style: "graph-y-axis"
                    }
                },
                tooltip: {
                    x: {
                        format: "yyyy/MM/dd"
                    },
                    intersect: true,
                    shared: false
                },
                markers: {
                    size: 5
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                      shade: 'dark',
                      type: "vertical",
                      shadeIntensity: 0.3,
                      gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
                      inverseColors: true,
                      opacityFrom: 1,
                      opacityTo: 1,
                      stops: [0, 50, 100],
                      colorStops: []
                    }
                  }
            },
        };
    }

    /*
        Runs on page load.
    */
    componentDidMount() {
        this.resetShownToesData();
    }

    /*
        Determines if data for the left foot is currently being shown to the user.
        returns: true if the left foot is being shown, false if the right foot is being shown.
    */
    isLeftFootShown() {
        return this.state.selectedFootIndex === LEFT_FOOT_ID;
    }

    /*
        Displays data corresponding to a certain foot on the graph when a foot is selected.
        param selectedFoot: Which foot to show data for.
    */
    viewFoot(selectedFoot) {
        var shownToes = gInitialToeSelection; //Show initial toes again when changing feet

        this.setState({
            shownToes: shownToes,
            selectedFootIndex: selectedFoot,
            showingDetails: false,
            treatmentIndex: 0
        },
            this.resetShownToesData //Call the function when state is changed
        );

        //Save the selected foot globally in the redux store
        //Need to know the selected foot to change the bottom cell
        store.dispatch(setSelectedFoot(selectedFoot));
    }

    /*
        Helps reset the graph when foot selection is changed.
        param shownToes: An array of the initially displayed toes on the graph.
    */
    resetShownToesData() {
        var toeData = []; //New toe data to be shown
        var data = this.isLeftFootShown() ? this.props.leftFootData : this.props.rightFootData;
        var dates = this.isLeftFootShown() ? this.props.leftFootDates : this.props.rightFootDates;

        for (let i = 0; i < this.state.shownToes.length; ++i) {
            if (this.state.shownToes[i] && data[i]) { //The user wants to see this toe
                toeData.push(data[i]); //Original data is stored in props
            }
            else {
                //Push blank entries so graph stays the same colour for each toe
                toeData.push({ name: "", data: [] });
            }
        }

        this.setState({
            series: toeData,
            options: {
                ...this.state.options,
                xaxis: {
                    ...this.state.options.xaxis,
                    categories: dates
                }
            }
        });
    }

    /*
        Displays data only for the toe the user clicked on.
        param num: The toe id clicked on.
    */
    showToe(num) {
        let shownToes = [false, false, false, false, false]; //Hide all toes

        if (shownToes[num] === undefined)//error handling 
            return

        shownToes[num] = true; //Except toe clicked on

        let selectedFoot = this.isLeftFootShown() ? this.props.leftFootData : this.props.rightFootData;
        let treatmentIndex = selectedFoot[num].data.filter(item => item === null).length; // accounting for the nulls in the data

        this.setState({
            shownToes: shownToes,
            treatmentIndex: treatmentIndex, //Also reset the treatmentIndex in case the user clicks a point on the graph
            showingDetails: false //Remove details from old toe
        },
            this.resetShownToesData
        );
    }

    /*
        Helps with the "Select All" button. If at least one toe is hidden,
        then all are shown, otherwise all toes are hidden on the graph.
    */
    showHideAllToes() {
        let shownToes = [false, false, false, false, false];
        let showAll = false; //Hide all toes by default

        for (let isToeShown of this.state.shownToes) {
            if (!isToeShown) { //At least one toe is hidden
                showAll = true; //Show all toes
                break;
            }
        }

        if (showAll) //Show all toes
            shownToes = [true, true, true, true, true];

        this.setState({
            shownToes: shownToes,
            treatmentIndex: 0,
            showingDetails: false //Remove details from old toe
        },
            this.resetShownToesData
        );
    }

    /*
        Determines if data for all toes are visible on the graph.
        returns: True if data for all toes are visuble on the graph, False otherwise.
    */
    areAllToesShown() {
        return this.state.shownToes.filter(isToeShown => isToeShown).length === TOE_COUNT; //All true means all toes are shown
    }

    /*
        Prints one of the buttons the user can press to select a toe.
        param toeId: The toe the button is for.
    */
    printToeButton(toeId) {
        //var defaultToeButtonClass = "graph-toe-button";
        //var activeToeButtonClass = defaultToeButtonClass + " active-toe-button"; //When the toe's data is being shown on the chart
        var allClasses = ["btnBigToe", "btnIndexToe", "btnMiddleToe", "btnFourthToe", "btnLittleToe"]
        //(this.state.shownToes[toeId] ? activeToeButtonClass : defaultToeButtonClass)
        if (allClasses[toeId] === undefined)
            return ""
        return (
            <button key={toeId} onClick={this.showToe.bind(this, toeId)}
                className={allClasses[toeId]} id={this.state.shownToes[toeId] ? "activetoe" : ""}>
            </button>
        );
    }

    /*
        Adds buttons to the page where user can select toes.
    */
    printToeButtons() {
        //var defaultToeButtonClass = "graph-toe-button";
        //var activeToeButtonClass = defaultToeButtonClass + " active-toe-button"; //For when all toe data is being shown on the chart
        var toeOrder = [];
        for (let i = 0; i < TOE_COUNT; ++i)
            toeOrder.push(i); //Initial view in order of ids (based on right foot)

        if (this.isLeftFootShown())
            toeOrder.reverse(); //Toes go in opposite order on left foot

        return (
            //Old toe selection
            /*<span className="toolbar">
                <button onClick={this.showHideAllToes.bind(this)}
                    className={(this.areAllToesShown() ? activeToeButtonClass : defaultToeButtonClass)}>
                    ALL
                </button>
                {
                    toeOrder.map((toeId) => this.printToeButton(toeId))
                }
            </span>*/
            <div className={this.isLeftFootShown() ? "leftFootContainer" : "rightFootContainer"}>
                <img src={this.isLeftFootShown() ? leftFootCroppedLogo : rightFootCroppedLogo} alt="left foot" />

                <button onClick={this.showHideAllToes.bind(this)} className="btnAlltoes"></button>
                {
                    toeOrder.map((toeId) => this.printToeButton(toeId))
                }
            </div>
        );
    }

    /*
        Shows the toe data on small preview section next to the graph.
    */
    printToeData(id, name, images, percentage) {
        var toeNames = [];

        for (let i = 0; i < TOE_COUNT; ++i)
            toeNames.push(GetToeName(i)) //Initial order in based on right foot

        var isToeNotIncluded = this.state.shownToes[toeNames.findIndex(toeName => toeName === name)];
        var imageIndex = this.state.treatmentIndex - percentage.filter(item => item === null).length; //Need to subtract the number of nulls from the treatment index because images dont have nulls		
        var fungalCoverage = percentage[this.state.treatmentIndex]; //Gets the fungal coverage based on the selected point on the graph

        return (
            ((images[imageIndex]) && isToeNotIncluded)
                ?
                <tr key={id}>
                    <td className="selected-details-image-col">
                        <img src={images[imageIndex] || images[0]} alt="img"
                            className="selected-details-image"
                        />
                    </td>
                    <td>{name}</td>
                    <td>{fungalCoverage}</td>
                </tr>
                :
                <tr key={id}></tr>
        )
    }

    /*
        If the user wants to see data from a certain date in the graph,
        it is printed next to the graph.
    */
    printSelectedDateDetails() {
        var footData = (this.isLeftFootShown()) ? this.props.leftFootData : this.props.rightFootData;
        var dates = (this.isLeftFootShown()) ? this.props.leftFootDates : this.props.rightFootDates;
        var selectedDate = dates[this.state.treatmentIndex];
        var footName = GetFootName(this.state.selectedFootIndex);

        return (
            <div className="selected-details-container split-graph">
                <Row className="selected-details-title">
                    {footName} Foot: {selectedDate}
                </Row>

                <Table striped bordered size="md" className="selected-details-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Toe Name</th>
                            <th>Fungal Coverage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            footData.map(({ name, images, data }, id) => this.printToeData(id, name, images, data))
                        }
                    </tbody>
                </Table>
            </div>
        );
    }

    /*
        Draws the graph to the page.
    */
    render() {
        var dateDetails;

        if (this.state.showingDetails) {
            dateDetails = this.printSelectedDateDetails();
        }
        else {
            dateDetails =
                <div className="selected-details-container selected-details-instructions">
                    <h6>Click on a point to view details!</h6>
                </div>
        }

        return (
            <div>
                {
                    //Buttons for changing which foot to view
                    GetDesktopFeetButtons(this, this.state.selectedFootIndex)
                }

                {/*Buttons to filter toes*/}
                <div lg="5" className="graph-container">

                    <div className="graph-sub-container shadow p-3 mb-5 bg-white rounded">
                        <div className="graph-chart shadow bg-white rounded">
                            {/*The actual chart itself*/}
                            <ReactApexChart options={this.state.options} series={this.state.series} type="area" height="300px" />
                        </div>

                        {/*Details off to the side about a specific date*/}
                        {dateDetails}
                    </div>
                    {this.printToeButtons()}
                    <h6 className="ToeButtonsFont">Red toes are selected</h6>
                </div>
            </div>
        );
    }
}

export default ApexChart;