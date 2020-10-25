import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import {Provider} from 'react-redux';
import store from './Redux/store';

import Navbar from './components/NavigationBar';
import FirstPage from './components/FirstPage';
import Login from './components/Login';
import Signup from './components/Signup';
import {Switch, Route, BrowserRouter as Router} from 'react-router-dom';
import Diagnosis from './components/Diagnosis';
import User from './components/User';
import jwt_decode from 'jwt-decode'
import setAuthHeader from './utils/setAuthHeader';
import { logOutUser, setCurrentUser } from './Redux/Actions/authAction';



//if the browser has the user's login info, 
//set the data and go to the user's page
if(localStorage.jwt){
  const token = localStorage.jwt;
  var decodedData = "invalid"
  try {
    decodedData = jwt_decode(token);

    setAuthHeader(token);
  
    const time = Date.now() /1000;
    //if the jwt is expired
    if(decodedData.exp < time){
      store.dispatch(logOutUser()); //remove the user
      window.location.href = "./User";
    }else{
      store.dispatch(setCurrentUser(decodedData));
      window.location.href = "./";
    }

  } catch (error) {
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
              <Route path="/User" component={User} exact/>
              <Route path="/Diagnosis" component={Diagnosis} exact/>
          </div>
        </Router>
    </Provider>
  );
}

export default App;
