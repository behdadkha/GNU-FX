/*
    A class for a page redirected to when some component does not exist.
*/

import React, {Component} from 'react'

import ErrorImg from "../icons/error404.png";

import "../componentsStyle/Component404.css";


export default class Component404 extends Component {
    /*
        Prints the 404 error page.
    */
    render() {
        return (
            <div className="Component404Center">
                <h1>404 Page not found</h1>
                <img src={ErrorImg} className="ErrorImg" alt="404 Error"></img>
            </div>
        )
    }
}
