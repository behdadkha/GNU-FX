import React from "react";
import ReactApexChart from "react-apexcharts"
import {Row, Col} from "react-bootstrap";
import store from "../../Redux/store";
import {setSelectedFoot} from "../../Redux/Actions/setFootAction";

//TODO: Function that runs when you click on a data point
//BUG: Clicking on bottom labels changes graph view but not selected buttons

const gInitialToeSelection = [true, true, false, false, false]; //Only first two toes start off shown (client request)

class ApexChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            treatmentIndex : 0, //user clicks on a point in the graph, this represents the clicked index
            series: this.props.leftFootData,
            options: {
                chart: {
                    height: 350,
                    type: "area",
                    events: {
                        click: (event, chartContext, config) => {
                            /*config.seriesIndex; //Number of big toe, index toe, etc. starting from 0
                            config.dataPointIndex; //Number of treatment date*/
                            this.setState({ treatmentIndex : config.dataPointIndex })
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
                },
            },
            showLeftFoot: true, //Start off showing the left foot
            shownToes: gInitialToeSelection,
            showingDetails: this.props.showingDetails, //Scrunch the graph on the left if showing details
        };
    }

    //changes the graph data
    //fires when either the Left Foot or Right Foot button is clicked
    viewFoot(showLeftFoot) {
        var shownToes = gInitialToeSelection; //Show initial toes again when changing feet


        this.setState({
            shownToes: shownToes,
			showLeftFoot: showLeftFoot,
			treatmentIndex : 0
        },
            this.resetShownToesData
        );

		//save the selected foot in the redux store
		// need to know the selected foot to change the buttom cell
		store.dispatch(setSelectedFoot(showLeftFoot ? 0 : 1)); 
    }

    
    resetShownToesData() {
        var toeData = []; //New toe data to be shown
        var toeDates = []; //New dates of toe data to be shown
        var data = (this.state.showLeftFoot) ? this.props.leftFootData : this.props.rightFootData;
        var dates = (this.state.showLeftFoot) ? this.props.leftFootDates : this.props.rightFootDates;

        //var shownToes = this.state.showToes;

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

    areAllToesShown() {
        return this.state.shownToes.filter(isToeShown => isToeShown).length === 5; //All true means all toes are shown
    }

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

    //show the toe data on small preview section next to the graph
    printToeData(id, name, images, percentage) {
        var toeNames = ["Big Toe", "Index Toe", "Middle Toe", "Fourth Toe", "Little Toe"];
        
        if (this.state.rightFootData)
            toeNames.reverse();

        var isToeNotIncluded = this.state.shownToes[toeNames.findIndex(toeName => toeName === name)];
        var imageIndex = this.state.treatmentIndex - percentage.filter(item => item === null).length;// need to subtract the number of nulls from the treatment index because images dont have nulls


		//getting the fungal coverage based on the selected point on the graph
		var fungalCoverage = percentage[this.state.treatmentIndex];

        return (
            ((images[imageIndex] || images[0]) && isToeNotIncluded)
            ?
                <Row key={id} className="selected-details-row">
                    <Col className="selected-details-col">{name}</Col>
                    <Col className="selected-details-col">{fungalCoverage || "NA"}</Col>
                    <Col className="selected-details-col">No Comments</Col>
                    <Col className="selected-details-col selected-details-right-col"><img src={images[imageIndex] || images[0]} alt="img"/></Col>
                </Row>
            :
                ""
        )
    }

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
                <Row className="selected-details-row">
                    <Col className="selected-details-col">Toe Name</Col>
                    <Col className="selected-details-col">Fungal Coverage</Col>
                    <Col className="selected-details-col">Comments</Col>
                    <Col className="selected-details-col selected-details-right-col">Image</Col>
                </Row>
                {
                    (footData) ? footData.map(({name, images, data}, id) => this.printToeData(id, name, images, data)) : ""
                }
                <Row className="selected-details-row selected-details-bottom-row"></Row>
            </div>
        );
    }

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
