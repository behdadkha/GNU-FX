import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Navbar from './components/NavigationBar';
import FirstPage from './components/FirstPage';
import Login from './components/Login';
import Signup from './components/Signup';
import {Link, Switch, Route, BrowserRouter as Router} from 'react-router-dom';
import User from './components/User';

function App() {
  return (
    <div className="App">
      <div className="navBar">
        <Navbar></Navbar>
      </div>
      <Router>
      <div>

        <Switch>
          <Route exact path="/">
            <FirstPage></FirstPage>
          </Route>
          <Route path="/login">
            <Login></Login>
          </Route>
          <Route path="/signup">
            <Signup></Signup>
          </Route>
          <Route path="/user">
            <User></User>
          </Route>
        </Switch>
      </div>
      </Router>
    </div>
  );
}

export default App;
