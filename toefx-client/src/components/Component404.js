import React, { Component } from 'react'
import "../componentsStyle/Component404.css";
import errorImg from "../icons/error404.png";
/*
    When entered path does not exist
*/
export default class Component404 extends Component {
    render() {
        return (
            <div className="Component404Center">
                <h1>404 Page not found</h1>
                <img src={errorImg} className="ErrorImg" alt="404 Error"></img>
            </div>
        )
    }
}
