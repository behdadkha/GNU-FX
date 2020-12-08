import React from "react";
import ReactApexChart from "react-apexcharts"

//TODO: Function that runs when you click on a data point
//BUG: Clicking on bottom labels changes graph view but not selected buttons


class ApexChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            series: this.props.leftFootData,
            options: {
                chart: {
                    height: 350,
                    type: "area"
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
                chart: {
                    events: {
                        click: function(event, chartContext, config) {
                            /*config.seriesIndex; //Number of big toe, index toe, etc. starting from 0
                            config.dataPointIndex; //Number of treatment date*/
                        }
                    }
                }
            },
            showLeftFoot: true, //Start off showing the left foot
            shownToes: [true, true, true, true, true], //All toes start off shown
        };
    }

    viewFoot(showLeftFoot) {
        var shownToes = [true, true, true, true, true]; //Show all toes again when changing feet

        this.setState({
            shownToes: shownToes,
            showLeftFoot: showLeftFoot
        })

        this.resetShownToesData(shownToes);
    }

    resetShownToesData(shownToes) {
        var toeData = []; //New toe data to be shown
        var toeDates = []; //New dates of toe data to be shown
        var data = (this.state.showLeftFoot) ? this.props.leftFootData : this.props.rightFootData;
        var dates = (this.state.showLeftFoot) ? this.props.leftFootDates : this.props.rightFootDates;

        for (let i = 0; i < shownToes.length; ++i) {
            if (shownToes[i]) { //The user wants to see this toe
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
            options: options,
        });
    }

    showHideToe(num) {
        let shownToes = this.state.shownToes;
        shownToes[num] = !shownToes[num]; //Flip shown or unshown

        this.setState({
            shownToes: shownToes
        })

        this.resetShownToesData(shownToes);
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
        });

        this.resetShownToesData(shownToes);
    }

    areAllToesShown() {
        return this.state.shownToes.filter(isToeShown => isToeShown).length === 5; //All true means all toes are shown
    }

    render() {
        var defaultToeButtonClass = "graph-toe-button";
        var defaultFootButtonClass = "graph-foot-button";
        var activeToeButtonClass = defaultToeButtonClass + " active-toe-button";
        var activeFootButtonClass = defaultFootButtonClass + " active-toe-button";

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
                    <span className="toolbar">
                        <button onClick={this.showHideAllToes.bind(this)}
                                className={(this.areAllToesShown() ? activeToeButtonClass : defaultToeButtonClass)}>
                            ALL
                        </button>

                        <button onClick={this.showHideToe.bind(this, 0)}
                                className={(this.state.shownToes[0] ? activeToeButtonClass : defaultToeButtonClass)}>
                            Big Toe
                        </button>

                        <button onClick={this.showHideToe.bind(this, 1)}
                                className={(this.state.shownToes[1] ? activeToeButtonClass : defaultToeButtonClass)}>
                            Index Toe
                        </button>

                        <button onClick={this.showHideToe.bind(this, 2)}
                                className={(this.state.shownToes[2] ? activeToeButtonClass : defaultToeButtonClass)}>
                            Middle Toe
                        </button>

                        <button onClick={this.showHideToe.bind(this, 3)}
                                className={(this.state.shownToes[3] ? activeToeButtonClass : defaultToeButtonClass)}>
                            Fourth Toe
                        </button>

                        <button onClick={this.showHideToe.bind(this, 4)}
                                className={(this.state.shownToes[4] ? activeToeButtonClass : defaultToeButtonClass)}>
                            Little Toe
                        </button>
                    </span>

                    {/*The actual chart itself*/}
                    <ReactApexChart options={this.state.options} series={this.state.series} type="area" height="300px" />
                </div>
            </div>
        );
    }
}

export default ApexChart;
