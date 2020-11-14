import React, { Component } from 'react';
import '../../../node_modules/react-vis/dist/style.css'
import { XYPlot, LineSeries, XAxis, YAxis } from 'react-vis'

export default class Graph extends Component {
    constructor(props){
        super(props);
        this.state = {
            width : window.innerHeight * 0.5,
            height : window.innerWidth * 0.32
        };
    }

    updateDimension = () => {
        this.setState({
            width : window.innerWidth,
            height : window.innerHeight
        });
    }

    componentDidMount(){
        window.addEventListener('resize', this.updateDimension);
    }

    componentWillMount(){
        window.removeEventListener('resize', this.updateDimension);
    }



    render() {
        

        const data = [
            { x: 0, y: 8 },
            { x: 1, y: 5 },
            { x: 2, y: 4 },
            { x: 3, y: 9 },
            { x: 4, y: 1 },
            { x: 5, y: 7 },
            { x: 6, y: 6 },
            { x: 7, y: 3 },
            { x: 8, y: 2 },
            { x: 9, y: 0 }
        ];
        return (
            <div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", float: "left", marginRight : "-5%", marginTop : "20%"}}>
                        <h6 style={{ writingMode: "vertical-rl" }}>Fungal coverage of nail</h6>
                    </div>
                    <div style={{ display: "flex" }}>
                        <XYPlot height={window.innerHeight * 0.5} width={window.innerWidth * 0.29}>
                            <LineSeries data={data} />
                            <XAxis />
                            <YAxis />
                        </XYPlot>
                    </div>
                </div>
                <div style={{ display: "inline-block"}}>
                    <h6>Treatment Date</h6>
                </div>
            </div>
        )
    }
}
