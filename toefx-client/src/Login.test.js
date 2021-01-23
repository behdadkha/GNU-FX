import React from 'react';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk'

import { render } from '@testing-library/react';
import { shallow, mount } from "enzyme";
import mockAxios from './__mocks__/axios';
import Login from './components/Login';
import axios from 'axios';

import jwt_decode from './__mocks__/jwt-decode';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


let email = "demo@gmail.com";
let password = "123";

//jest.mock(axios);

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
describe("login functions work", () => {
    it("sets states correctly", async () => {
        const component = shallow(<Login />);
        component.setState({email: "demo@gmail.com", password: "123"});
        expect(component.state('email')).toEqual("demo@gmail.com");
        expect(component.state('password')).toEqual("123");
    });
    
});

describe("handleLoginPatient works correctly", () => {
    let component
    beforeEach(() => {
        component = shallow(<Login/>);
        window.location.reload = jest.fn();
    });
    it("calls the api for login", async () => {

        const instance = component.instance();
        component.setState({email: email, password: password});

        jest.spyOn(instance, 'redirectTo').mockImplementation((e) => e);

        await component.instance().handleLoginPatient({preventDefault: () => {}});
        
        expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/login', {email: email, password: password})
        expect(axios.get).toHaveBeenCalled();
        expect(window.location.reload).toHaveBeenCalled();
        expect(instance.redirectTo).toBeCalled();

        //the function gets called but it get registered here
    });
    it("redirects to the user page /user", async() => {
        const instance = component.instance();
        component.setState({email: email, password: password});

        jest.spyOn(instance, 'redirectTo').mockImplementation((e) => e);

        await component.instance().handleLoginPatient({preventDefault: () => {}});
        
        expect(instance.redirectTo).toHaveBeenCalledWith('/user');
    });

    it("handles invalid user", async() => {
        const instance = component.instance();
        component.setState({email: email, password: password});
        mockAxios.post.mockImplementation(() => Promise.resolve({status: 400, data: { success: false, token: "Bearer asdf"}}));
        jest.spyOn(instance, 'redirectTo').mockImplementation((e) => e);
        
        await component.instance().handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('invalidUser')).toEqual(true);
    });

    it("handles login request resolved but no data", async() => {
        const instance = component.instance();
        component.setState({email: email, password: password});
        mockAxios.post.mockImplementation(() => Promise.resolve({status: 200}));
        jest.spyOn(instance, 'redirectTo').mockImplementation((e) => e);

        await component.instance().handleLoginPatient({preventDefault: () => {}});
        
        expect(component.state('invalidUser')).toEqual(true);
    });

    it("dispaches set current user(redux store)", async() => {
        const instance = component.instance();
        component.setState({email: email, password: password});
        let store = mockStore({auth: {}, foot: {}});
        store.dispatch = jest.fn(() => console.log("fd"));
        
        await component.instance().handleLoginPatient({preventDefault: () => {}});
        
        expect(store.dispatch).toHaveBeenCalled();
    });
})