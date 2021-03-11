/*
    Class for the home page of the app. It is designed to look
    similar to ToeFX's main website.
*/

import React, {Component} from "react";
import {Container, Button} from "react-bootstrap";
import {isMobile} from "react-device-detect";
import {connect} from "react-redux";

import "../componentsStyle/FirstPage.css";

//Data for the boxes with descriptions that appear on the homepage
const gBoxHeadings = [
    "About ToeFX",
    "Online Diagnosis",
    "Create Your Storyline",
];

const gBoxDescriptions = [
    <span>
        ToeFX Inc. is a Canadian medical device
        company that has created a safe, fast
        solution for the treatment of toenail
        fungus (onychomycosis). The solution is
        based on photodynamic therapy. Visit our
        online store at www.drtoe.com.
    </span>,

    <span>
        With two easy steps, find out if your
        toenails are infected.
    </span>,

    <span>
        Take pictures of your toenails during
        the course of your treatment and create
        a storyline of your treatment progress.
    </span>
];


class FirstPage extends Component {
    /*
        Redirects the user to the dashboard if they're already logged in on a mobile device.
        The only way to return to the original screen on mobile is by logging out.
    */
    componentDidMount() {
        if (isMobile) //There's no first page on mobile, so redirect to appropriate page
        {
            if (this.props.auth.isAuth) //User is logged in
                this.props.history.push("/user"); //Go to image view
            else
                this.props.history.push("/login"); //Go to login screen

            window.location.reload(); //Helps fix navbar
        }
    }

    /*
        Reroutes the user to the Log In page and reloads the dashboard.
    */
    gotoLoginPage() {
        this.props.history.push("/login");
    }

    /*
        Reroutes the user to the Sign Up page and reloads the dashboard.
    */
    gotoSignUpPage() {
        this.props.history.push("/signup");
    }

    /*
        Prints the home page for desktop browsers.
    */
    desktopView() {
        var boxes = []; //Holds boxes with text that appear on the lower half of the page

        //Create each of the three boxes to be displayed
        for (let i = 0; i < gBoxDescriptions.length; ++i) {
            boxes.push(
                <div className={"box box" + (i + 1).toString()}> {/* Each box has a class like "box1" or "box2" that determines its colour*/}
                    <h6 className="boxHeading">{gBoxHeadings[i]}</h6>
                    <div className="boxDescriptionDiv">
                        <h6 className="boxDescription">{gBoxDescriptions[i]}</h6>
                    </div>
                </div>
            )
        }

        return (
            <div>
                {/* Image form ToeFX homepage */}
                <img className="image"
                        src="https://toefx.com/wp-content/uploads/2019/09/pipette.jpg"
                        alt="pipette"
                ></img>

                {/* Three boxes designed to look similar to the ones on the original ToeFX webpage */}
                <Container fluid className="home-page-boxes">
                    {boxes}
                </Container>
            </div>
        );
    }

    /*
        Prints the home page for mobile browsers.
    */
    mobileView() {
        return (
            <div>
                <div className="homepage-mobile-buttons">
                    <Button className="homepage-mobile-button" onClick={() => this.gotoLoginPage()}>
                        Log In
                    </Button>

                    <Button className="homepage-mobile-button" onClick={() => this.gotoSignUpPage()}>
                        Sign Up
                    </Button>
                </div>
            </div>
        );
    }

    /*
        Prints the home page to the screen.
    */
    render() {
        if (isMobile)
            return this.mobileView();

        return this.desktopView();
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(FirstPage);
