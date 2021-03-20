import { Button } from 'react-bootstrap';
import React, { Component } from 'react'
import { GetFootSymbolByActive, LEFT_FOOT_ID, RIGHT_FOOT_ID } from '../../Utils';
import { isMobile } from 'react-device-detect';

export default class FeetButtons extends Component {
    
    render() {
        var defaultFootButtonClass = "graph-foot-button"; //The general CSS for the feet buttons
        return (
            <div className="graph-feet-buttons">
                <Button onClick={this.props.onFootSelect.bind(this, LEFT_FOOT_ID)}
                    className={defaultFootButtonClass}>
                    <img src={GetFootSymbolByActive(LEFT_FOOT_ID, this.props.selectedFootIndex)}
                            className={!isMobile?"footlogo":"footlogo-mobile"} alt="Left Foot"/>
                </Button>
    
                <Button onClick={this.props.onFootSelect.bind(this, RIGHT_FOOT_ID)}
                    className={defaultFootButtonClass}>
                    <img src={GetFootSymbolByActive(RIGHT_FOOT_ID, this.props.selectedFootIndex)}
                            className={!isMobile?"footlogo":"footlogo-mobile"} alt="Right Foot"/>
                </Button>
            </div>
        );
    }
}
