/*
    Class for the chart that appears showing patient treatment improvement.
*/

import React from "react";
import ReactApexChart from "react-apexcharts"
import {Row, Table} from "react-bootstrap";

import store from "../../Redux/store";
import {setSelectedFoot} from "../../Redux/Actions/setFootAction";

//TODO: Function that runs when you click on a data point
//BUG: Clicking on bottom labels changes graph view but not selected buttons

const gInitialToeSelection = [true, true, false, false, false]; //Only first two toes start off shown (client request)

class ApexChart extends React.Component {

    //Sets up initial data for the chart
    constructor(props) {
        super(props);

        //Initially data for the left foot is shown, so set up the graph to show it
        this.state = {
            treatmentIndex : 0, //User clicks on a point in the graph, this represents the clicked index
            series: this.props.leftFootData,
            options: {
                chart: {
                    height: 350,
                    type: "area",
                    events: {
                        click: (event, chartContext, config) => {
                            /*config.seriesIndex; //Number of big toe, index toe, etc. starting from 0
                            config.dataPointIndex; //Number of treatment date*/
                            if (config.dataPointIndex >= 0) 
                                this.setState({ treatmentIndex: config.dataPointIndex,  showingDetails: true})
                        }
                    }
                },
                dataLabels: {
                    enabled: false
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
                        style: {
                            color: "black",
                            fontSize: '16px',
                            fontFamily: 'Arial, sans-serif',
                            fontWeight: 0,
                        },
                    }
                },
                tooltip: {
                    x: {
                        format: "yyyy/MM/dd"
                    },
                    intersect : true,
                    shared: false
                },
                markers: {
                    size : 5
                }
            },
            showLeftFoot: true, //Start off showing the left foot
            shownToes: gInitialToeSelection, //Initially only show certain toe
            showingDetails: this.props.showingDetails, //Scrunch the graph on the left if showing details
        };
    }

    componentDidMount() {
        this.resetShownToesData();
    }

    /*
        Displays data corresponding to a certain foot on the graph when a foot is selected.
        param showLeftFoot: If true show data for the left foot, otherwise show data for the right foot
    */
    viewFoot(showLeftFoot) {
        var shownToes = gInitialToeSelection; //Show initial toes again when changing feet


        this.setState({
            shownToes: shownToes,
            showLeftFoot: showLeftFoot,
            showingDetails: false,
			treatmentIndex: 0
        },
            this.resetShownToesData
        );

		//save the selected foot in the redux store
		// need to know the selected foot to change the bottom cell
		store.dispatch(setSelectedFoot(showLeftFoot ? 0 : 1)); 
    }

    /*
        Helps reset the graph when foot selection is changed.
        param shownToes: An array of the initially displayed toes on the graph.
    */
    resetShownToesData() {
        var toeData = []; //New toe data to be shown
        var toeDates = []; //New dates of toe data to be shown
        var data = (this.state.showLeftFoot) ? this.props.leftFootData : this.props.rightFootData;
        var dates = (this.state.showLeftFoot) ? this.props.leftFootDates : this.props.rightFootDates;

        for (let i = 0; i < this.state.shownToes.length; ++i) {
            if (this.state.shownToes[i]) { //The user wants to see this toe
                toeData.push(data[i]); //Original data is stored in props
                toeDates.push(dates[i]); //Original data is stored in props
            }
            else {
                //Push blank entries so graph stays the same colour for each toe
                toeData.push({name: "", data: []});
                toeDates.push("");
            }
        }

        var options = this.state.options;
        options.xaxis.categories = toeDates;

        this.setState({
            series: toeData,
            options: options
        });
    }

    /*
        Displays data only for the toe the user clicked on.
        param num: The toe id clicked on.
    */
    showToe(num) {
        let shownToes = [false, false, false, false, false]; //Hide all toes
		shownToes[num] = true; //Except toe clicked on
		
		let selectedFoot = (this.state.showLeftFoot) ? this.props.leftFootData : this.props.rightFootData;
        let treatmentIndex = selectedFoot[num].data.filter(item => item === null).length ; // accounting for the nulls in the data
    
        this.setState({
            shownToes: shownToes,
            treatmentIndex : treatmentIndex //also, reset the treatmentIndex in case the user clicks a point on the graph
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
        let val = false; //Hide all toes by default

        for (let isToeShown of this.state.shownToes) {
            if (!isToeShown) { //At least one toe is hidden
                val = true; //Show all toes
                break;
            }
        }

        if (val) //Show all toes
            shownToes = [true, true, true, true, true];

        this.setState({
			shownToes: shownToes,
			treatmentIndex : 0
        },
            this.resetShownToesData
        );

        
    }

    /*
        Determines if data for all toes are visible on the graph.
        returns: True if data for all toes are visuble on the graph, False otherwise.
    */
    areAllToesShown() {
        return this.state.shownToes.filter(isToeShown => isToeShown).length === 5; //All true means all toes are shown
    }

    /*
        Adds buttons to the page where user can select or deselect toes.
    */
    printToeButtons() {
        var toeNames = ["Big Toe", "Index Toe", "Middle Toe", "Fourth Toe", "Little Toe"];
        var toeOrder =  [0, 1, 2, 3, 4];
        var defaultToeButtonClass = "graph-toe-button";
        var activeToeButtonClass = defaultToeButtonClass + " active-toe-button";

        if (this.state.showLeftFoot)
            toeOrder.reverse(); //Toes go in opposite order on left foot

        return (
            <span className="toolbar">
                <button onClick={this.showHideAllToes.bind(this)}
                        className={(this.areAllToesShown() ? activeToeButtonClass : defaultToeButtonClass)}>
                    ALL
                </button>

                <button onClick={this.showToe.bind(this, toeOrder[0])}
                        className={(this.state.shownToes[toeOrder[0]] ? activeToeButtonClass : defaultToeButtonClass)}>
                    {toeNames[toeOrder[0]]}
                </button>

                <button onClick={this.showToe.bind(this, toeOrder[1])}
                        className={(this.state.shownToes[toeOrder[1]] ? activeToeButtonClass : defaultToeButtonClass)}>
                    {toeNames[toeOrder[1]]}
                </button>

                <button onClick={this.showToe.bind(this, toeOrder[2])}
                        className={(this.state.shownToes[toeOrder[2]] ? activeToeButtonClass : defaultToeButtonClass)}>
                    {toeNames[toeOrder[2]]}
                </button>

                <button onClick={this.showToe.bind(this, toeOrder[3])}
                        className={(this.state.shownToes[toeOrder[3]] ? activeToeButtonClass : defaultToeButtonClass)}>
                    {toeNames[toeOrder[3]]}
                </button>

                <button onClick={this.showToe.bind(this, toeOrder[4])}
                        className={(this.state.shownToes[toeOrder[4]] ? activeToeButtonClass : defaultToeButtonClass)}>
                    {toeNames[toeOrder[4]]}
                </button>
            </span>
        );
    }

    /*
        Shows the toe data on small preview section next to the graph
    */
    printToeData(id, name, images, percentage) {
        var toeNames = ["Big Toe", "Index Toe", "Middle Toe", "Fourth Toe", "Little Toe"];
        
        if (this.state.rightFootData)
            toeNames.reverse();

        var isToeNotIncluded = this.state.shownToes[toeNames.findIndex(toeName => toeName === name)];
        var imageIndex = this.state.treatmentIndex - percentage.filter(item => item === null).length;// need to subtract the number of nulls from the treatment index because images dont have nulls

		//getting the fungal coverage based on the selected point on the graph
		var fungalCoverage = percentage[this.state.treatmentIndex];
        return (
            ((images[imageIndex]) && isToeNotIncluded)
            ?
                <tr key={id}>
                    <td style={{width : "150px"}}>
                        <img 
                            src={images[imageIndex] || images[0]} 
                            alt="img" 
                            style={{width : "150px", height : "100px", borderRadius : "8px", padding : "5px 0 5px 0"}}
                        />
                    </td>
                    <td>{name}</td>
                    <td>{fungalCoverage}</td>
                    <td>No Comments</td>
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
        var footData = (this.state.showLeftFoot) ? this.props.leftFootData : this.props.rightFootData;
        var dates = (this.state.showLeftFoot) ? this.props.leftFootDates : this.props.rightFootDates;
		var selectedDate = dates[this.state.treatmentIndex];
        var footName = (this.state.showLeftFoot) ? "Left" : "Right";

        return (
            <div className="selected-details-container split-graph">
                <Row className="selected-details-title">
                    {footName} Foot: {selectedDate}
                </Row>
                
                <Table striped bordered size="md" style={{textAlign : "left", width : "95%", marginLeft : "2%"}}>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Toe Name</th>
                            <th>Fungal coverage</th>
                            <th>Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        (footData[4].data) ? footData.map(({name, images, data}, id) => this.printToeData(id, name, images, data)) : <tr></tr>
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
        var defaultFootButtonClass = "graph-foot-button";
        var activeFootButtonClass = defaultFootButtonClass + " active-toe-button";
        var graphClassName = "";
        var dateDetails = "";
        var flexClassName = "";

        if (this.state.showingDetails)
        {
            graphClassName += "split-graph";
            dateDetails = this.printSelectedDateDetails();
            flexClassName = "display-flex";
        }

        return (
            <div>
                {/* Buttons to change which foot is being viewed */}
                <div className="graph-feet-buttons">
                    <button onClick={this.viewFoot.bind(this, true)}
                                className={(this.state.showLeftFoot ? activeFootButtonClass : defaultFootButtonClass)}>
                            Left Foot
                    </button>

                    <button onClick={this.viewFoot.bind(this, false)}
                                className={(!this.state.showLeftFoot ? activeFootButtonClass : defaultFootButtonClass)}>
                            Right Foot
                    </button>
                </div>

                {/*Buttons to filter toes*/}
                <div lg="5" className="graph">
                    {
                        this.printToeButtons()
                    }
                    <div className={flexClassName}>
                        <div className={graphClassName}>
                            {/*The actual chart itself*/}
                            <ReactApexChart options={this.state.options} series={this.state.series} type="area" height="300px" />
                        </div>

                        {/*Details off to the side about a specific date*/}
                        {dateDetails}
                    </div>
                </div>
            </div>
        );
    }
}

export default ApexChart;
