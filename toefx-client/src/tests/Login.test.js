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
import { Provider } from 'react-redux';
import { SetCurrentUser } from '../Redux/Actions/authAction';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


let email = "demo@gmail.com";
let password = "123";

//jest.mock(Axios);

describe("login states are initialized correctly", () => {

    it("invalidUser is set to false", () => {
        let component = mount(<Provider store={store}><Login/></Provider>);
        component = component.find(Login).children();
        expect(component.state('email')).toEqual('');
        expect(component.state('password')).toEqual('');
        expect(component.state('errorMessage')).toEqual('');

    })

});
describe("rendering componentes", () => {

    it("renders login page without crashing", () => {
        mount(<Provider store={store}><Login/></Provider>);
    });
    
});
describe("login states work", () => {
    
    it("sets states correctly", async () => {
        let component = mount(<Provider store={store}><Login/></Provider>);
        component = component.find(Login).children()
        component.setState({email: "demo@gmail.com", password: "123"});
        expect(component.state('email')).toEqual("demo@gmail.com");
        expect(component.state('password')).toEqual("123");
    });
    
});

describe("handleLoginPatient works correctly", () => {

    let component, mockedHistory, instance, store

    beforeEach(() => {
        Axios.post = jest.fn(() => Promise.resolve({status: 202, data: { success: true, token: "Bearer asdf"}}));
        Axios.get = jest.fn(() => Promise.resolve({data: []}));
        store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
        store.dispatch = jest.fn();
        component = mount(<Provider store={store}><Login history={mockedHistory}/></Provider>);
        component = component.find(Login).children()
        instance = component.instance();
        window.location.href = jest.fn();
        
    });
    

    it("calls the api for login", async () => {

        
        instance.setState({email: email, password: password});

        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(Axios.post).toHaveBeenCalledWith(`${config.dev_server}/login`, {email: email, password: password});
        expect(window.location.href).toEqual("http://localhost/")

    });

    it("redirects to the user page /user", async() => {

        instance.setState({email: email, password: password});
        await instance.handleLoginPatient({preventDefault: () => {}}); 

    });

    it("handles invalid user", async() => {

        Axios.post = jest.fn(() => Promise.resolve({status: 404, data: { success: false, token: "Bearer asdf"}}));
        await instance.handleLoginPatient({preventDefault: () => {}});

        expect(component.state('errorMessage')).toEqual("INVALID_CREDENTIALS");

    });

    it("handles server rejection", async() => {

        Axios.post.mockRejectedValueOnce();
        await instance.handleLoginPatient({preventDefault: () => {}});

        expect(component.state('errorMessage')).toEqual("INVALID_CREDENTIALS");

    });


    it("handles login request resolved but no data", async() => {

        Axios.post = jest.fn(() => Promise.resolve({status: 200}));
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('errorMessage')).toEqual("INVALID_CREDENTIALS");

    });

    it("handles empty email and password states", async() => {

        instance.setState({email: "", password: ""}); 
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('email')).toEqual("");
        expect(component.state('password')).toEqual("");
        expect(Axios.post).toHaveBeenCalledTimes(0);// post request is not called

    });

    it("handles empty email and password states", async() => {

        instance.setState({email: "", password: ""});
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('email')).toEqual("");
        expect(component.state('password')).toEqual("");
        expect(Axios.post).toHaveBeenCalledTimes(0);// post request is not called

    });

    it("can handle if email state is empty", async() => {

        instance.setState({email: "", password: "123"});
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('email')).toEqual("");
        expect(component.state('password')).toEqual("123");
        expect(Axios.post).toHaveBeenCalledTimes(0);// post request is not called

    });

    it("can handle if password state is empty", async() => {

        instance.setState({email: "some@gmail.com", password: ""});
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('email')).toEqual("some@gmail.com");
        expect(component.state('password')).toEqual("");
        expect(Axios.post).toHaveBeenCalledTimes(0);// post request is not called

    });

    it("does not accept invalid email format", async() => {

        instance.setState({email: "s</ome%gmail.com", password: "123"});
        await instance.handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('errorMessage')).toEqual("INVALID_EMAIL");
        expect(Axios.post).toHaveBeenCalledTimes(0);// post request is not called
        
    });

});


//might come in handy
//prints out the elements
//component.find('[type="email"]').forEach(wrapper => console.log(wrapper.debug()));