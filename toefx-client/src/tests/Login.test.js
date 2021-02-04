import React from 'react';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk'

import { render } from '@testing-library/react';
import { shallow, mount } from "enzyme";
import Login from '../components/Login';
import store from '../Redux/store'
import * as footAction from '../Redux/Actions/setFootAction.js';
import {config} from "../config";
import Axios from 'axios';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


let email = "demo@gmail.com";
let password = "123";

//jest.mock(Axios);

describe("login states are initialized correctly", () => {

    it("invalidUser is set to false", () => {
        const component = shallow(<Login />);
        expect(component.state('invalidUser')).toEqual(false);
    })

});
describe("rendering componentes", () => {

    it("renders login page without crashing", () => {
        shallow(<Login />);
    });
    
});
describe("login states work", () => {
    
    it("sets states correctly", async () => {
        const component = shallow(<Login />);
        component.setState({email: "demo@gmail.com", password: "123"});
        expect(component.state('email')).toEqual("demo@gmail.com");
        expect(component.state('password')).toEqual("123");
    });
    
});

describe("handleLoginPatient works correctly", () => {

    let component
    let mockedHistory
    let instance

    beforeEach(() => {
        Axios.post = jest.fn(() => Promise.resolve({status: 200, data: { success: true, token: "Bearer asdf"}}));
        Axios.get = jest.fn(() => Promise.resolve({data: []}));
        mockedHistory = {push: jest.fn()}
        component = shallow(<Login history={mockedHistory}/>);
        component.setState({email: email, password: password});
        instance = component.instance()
        window.location.reload = jest.fn();
        
    });
    

    it("calls the api for login", async () => {

        
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(Axios.post).toHaveBeenCalledWith(`${config.dev_server}/login`, {email: email, password: password})
        expect(Axios.get).toHaveBeenCalled();
        expect(window.location.reload).toHaveBeenCalled();
        expect(mockedHistory.push).toHaveBeenCalled();

    });

    it("redirects to the user page /user", async() => {

        await instance.handleLoginPatient({preventDefault: () => {}}); 

        expect(mockedHistory.push).toHaveBeenCalledWith('/user');

    });

    it("handles invalid user", async() => {

        Axios.post = jest.fn(() => Promise.resolve({status: 404, data: { success: false, token: "Bearer asdf"}}));
        await instance.handleLoginPatient({preventDefault: () => {}});

        expect(component.state('invalidUser')).toEqual(true);

    });

    it("handles server rejection", async() => {

        Axios.post.mockRejectedValueOnce();
        await instance.handleLoginPatient({preventDefault: () => {}});

        expect(component.state('invalidUser')).toEqual(true);

    });


    it("handles login request resolved but no data", async() => {

        Axios.post = jest.fn(() => Promise.resolve({status: 200}));
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('invalidUser')).toEqual(true);

    });

    it("calls the store.dispatch 3 times", async() => {

        store.dispatch = jest.fn();
        footAction.getAndSaveImages = jest.fn();
        footAction.getAndSaveToeData = jest.fn();

        await instance.handleLoginPatient({preventDefault: () => {}});

        expect(store.dispatch).toHaveBeenCalledTimes(3);
        //one time to set the user
        expect(store.dispatch).toHaveBeenCalledWith({"payload": {"id": "0000", "name": "auto tester"}, "type": "SET_CURRENT_USER"});
        //one time to get images
        expect(footAction.getAndSaveImages).toHaveBeenCalledTimes(1);
        //one time to get the toe data
        expect(footAction.getAndSaveToeData).toHaveBeenCalledTimes(1);

    });

    it("handles empty email and password states", async() => {

        component.setState({email: "", password: ""}); 
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('email')).toEqual("");
        expect(component.state('password')).toEqual("");
        expect(Axios.post).toHaveBeenCalledTimes(0);// post request is not called

    });

    it("handles empty email and password states", async() => {

        component.setState({email: "", password: ""});
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('email')).toEqual("");
        expect(component.state('password')).toEqual("");
        expect(Axios.post).toHaveBeenCalledTimes(0);// post request is not called

    });

    it("can handle if email state is empty", async() => {

        component.setState({email: "", password: "123"});
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('email')).toEqual("");
        expect(component.state('password')).toEqual("123");
        expect(Axios.post).toHaveBeenCalledTimes(0);// post request is not called

    });

    it("can handle if password state is empty", async() => {

        component.setState({email: "some@gmail.com", password: ""});
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('email')).toEqual("some@gmail.com");
        expect(component.state('password')).toEqual("");
        expect(Axios.post).toHaveBeenCalledTimes(0);// post request is not called

    });

    it("does not accept invalid email format", async() => {

        component.setState({email: "s</ome%gmail.com", password: "123"});
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('email')).toEqual("");
        expect(component.state('password')).toEqual("123");
        expect(Axios.post).toHaveBeenCalledTimes(0);// post request is not called
        
    });

});

describe('testing the Login UI functionalities', () => {

    let component, submit_button, emailField, passwordField

    beforeEach(() => {

        component = mount(<Login history={{push: jest.fn()}}/>);
        submit_button = component.find('Button');
        emailField = component.find('[type="email"]').first();
        passwordField = component.find('[type="password"]').first();

    });


    it("renders empty input fields", async() => {

        expect(emailField.props().value).toEqual("");
        expect(passwordField.props().value).toEqual("");

    });

    it("correctly sets the email and password state from the input fields", async() => {

        emailField.simulate('change', {target: {value: "demo@gmail.com"}});
        passwordField.simulate('change', {target: {value: "123"}});

        expect(component.state('email')).toEqual("demo@gmail.com");
        expect(component.state('password')).toEqual("123");

    });

    it("can handle empty fields", async() => {

        emailField.simulate('change', {target: {value: ""}});
        passwordField.simulate('change', {target: {value: ""}});

        component.find('Form').simulate('submit', {
            preventDefault: () => {}
        })

        expect(component.state('email')).toEqual("");
        expect(component.state('password')).toEqual("");
        expect(Axios.post).toHaveBeenCalledTimes(0);// post request is not called
    });

    it("inputs remove white spaces", async() => {

        emailField.simulate('change', {target: {value: " demo@gmail.com"}});
        passwordField.simulate('change', {target: {value: " 123"}});

        //states are not set
        expect(component.state('email')).toEqual("demo@gmail.com");
        expect(component.state('password')).toEqual("123");

    });

    it("correctly removes unnecessary spaces from the end of the input", async() => {

        emailField.simulate('change', {target: {value: "demo@gmail.com     "}});
        passwordField.simulate('change', {target: {value: "123  "}});

        //white spaces are removed
        expect(component.state('email')).toEqual("demo@gmail.com");
        expect(component.state('password')).toEqual("123");

    });

    it("shows 'Please enter valid credentials.' if the server doesnt find the user", async() => {

        Axios.post = jest.fn(() => Promise.resolve({status: 404}));
        component.setState({email: "fake@gmail.com", password: "123"});

        await component.find('Form').simulate('submit');

        expect(component.state('invalidUser')).toEqual(true);
        expect(component.find(".login-error").childAt(0).text()).toEqual("Please enter valid credentials.");

    });


});

//might come in handy
//prints out the elements
//component.find('[type="email"]').forEach(wrapper => console.log(wrapper.debug()));