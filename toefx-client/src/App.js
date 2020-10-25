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
