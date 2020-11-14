import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {Provider} from "react-redux";
import store from "./Redux/store";

import Navbar from "./components/NavigationBar";
import FirstPage from "./components/FirstPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import {Route, BrowserRouter as Router} from "react-router-dom";
import NewUser from "./components/user/NewUser";
import jwt_decode from "jwt-decode";
import setAuthHeader from "./utils/setAuthHeader";
import {logOutUser, setCurrentUser} from "./Redux/Actions/authAction";
import Storyline from "./components/user/Storyline";
import Diagnosis from "./components/user/Diagnosis";

//if the browser has the user's login info,
//set the data and go to the user's page
if (localStorage.jwt) {
    const token = localStorage.jwt;
    var decodedData = "invalid";
    try {
        const time = Date.now() / 1000;
        decodedData = jwt_decode(token);
        setAuthHeader(token);

        //if the jwt is expired
        if (decodedData.exp < time)
            store.dispatch(logOutUser()); //remove the user
        else
            store.dispatch(setCurrentUser(decodedData));
    }
    catch (error) {
        console.log("invalid jwt");
        store.dispatch(logOutUser());
    }
}

function App() {
  return (
    <Provider store={store}>
        <Router>
          <div className="App">
              <div className="navBar">
                <Navbar></Navbar>
              </div>
              <Route path="/" component={FirstPage} exact/>
              
              <Route path="/login" component={Login} exact/> 
              <Route path="/signup" component={Signup} exact />
              <Route path="/user" component={NewUser} exact/>
              <Route path="/Diagnosis" component={Diagnosis} exact/>
              <Route path="/Storyline" component={Storyline} exact/>
          </div>
        </Router>
    </Provider>
  );
}

export default App;
