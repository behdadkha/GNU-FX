/*
    The main page of the application.
*/

import React from "react";
import { Provider } from "react-redux";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import jwt_decode from "jwt-decode";
import { SetAuthHeader } from "./Utils";
import FirstPage from "./components/FirstPage";
import Login from "./components/Login";
import Navbar from "./components/NavigationBar";
import Signup from "./components/Signup";
import MyAccount from "./components/user/MyAccount";
import ResetPassword from "./components/user/ResetPassword";
import Schedule from "./components/user/Schedule";
import Upload from "./components/user/Upload";
import User from "./components/user/User";
import Component404 from "./components/Component404";
import store from "./Redux/store";
import { LogOutUser, SetCurrentUser } from "./Redux/Actions/authAction";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

//If the browser has the user's login info,
//set the data and go to the user's page
if (localStorage.jwt) {
    const token = localStorage.jwt;
    var decodedData = "invalid";

    try {
        const time = Date.now() / 1000;
        decodedData = jwt_decode(token);
        SetAuthHeader(token);

        //If the jwt is expired
        if (decodedData.exp < time)
            store.dispatch(LogOutUser()); //Remove the user
        else
            store.dispatch(SetCurrentUser(decodedData));
    }
    catch (error) {
        console.log("invalid jwt");
        store.dispatch(LogOutUser());
    }
}

function App() {
    const pagesWithNavbar = ["/", "/signup", "/login", "/upload"];
    return (
        <Provider store={store}>
            <Router>
                
                    <div className="App">
                        {
                            //Only show the navigation bar on certain pages so no scrolling is required
                            pagesWithNavbar.includes(window.location.pathname)
                                ?
                                <div className="navBar">
                                    <Navbar></Navbar>
                                </div>
                                :
                                <div></div> //Empty container
                        }

                        {/* Set up the routing */}
                        <Switch>
                            <Route path="/" component={FirstPage} exact />

                            <Route path="/login" component={Login} exact />
                            <Route path="/signup" component={Signup} exact />
                            <Route path="/user" component={User} exact />
                            <Route path="/upload" component={Upload} exact />
                            <Route path="/user/schedule" component={Schedule} exact />
                            <Route path="/user/myAccount" component={MyAccount} exact />
                            <Route path="/user/resetPassword" component={ResetPassword} exact />
                            <Route component={Component404} />
                        </Switch>
                    </div>
            </Router>
        </Provider>
    );
}

export default App;
