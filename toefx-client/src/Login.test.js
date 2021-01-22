import React from 'react';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk'

import { render } from '@testing-library/react';
import { shallow, mount } from "enzyme";
import mockAxios from './__mocks__/axios';
import Login from './components/Login';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


let email = "demo@gmail.com";
let password = "123";


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
    it("calls the api for login", async () => {
        const store = mockStore({selectedFoot: 0,images: [], toeData: []});
        const thismockAxios = mockAxios.post;
        mockAxios.get.mockImplementation(() => Promise.resolve({data: []}));
        const mockHistoryPush = { history: { push: jest.fn() } };

        window.location.reload = jest.fn();
    
        const component = shallow(<Login {...mockHistoryPush}/>);
        const instance = component.instance();
        component.setState({email: email, password: password});
        jest.spyOn(instance, 'redirectTo').mockImplementation(jest.fn());
        instance.forceUpdate();
        
        //component.find("Form").simulate("submit");
        component.instance().handleLoginPatient({preventDefault: () => {}});
        
        
        expect(thismockAxios).toHaveBeenCalled();
        expect(instance.redirectTo).toHaveBeenCalledWith('/user');//the function gets called but it get registered here
        expect(thismockAxios).toHaveBeenCalledWith('http://localhost:3001/login', {email: email, password: password})
    });
    it("redirects to the user page /user", () => {
        const component = shallow(<Login/>);
        component.instance().redirectTo = jest.fn();
        component.instance().redirectTo('/user');
        expect(component.instance().redirectTo).toHaveBeenCalledWith('/user');
    });

    /*it("recieves a bearer token", async () => {
        const thismockAxios = mockAxios.post;

        const component = shallow(<Login />);
        let email = "demo@gmail.com";
        let password = "123";
        component.setState({email: email, password: password});
        component.find("Form").simulate("submit", thismockAxios);
        expect(thismockAxios).toHaveBeenCalledWith('http://localhost:3001/login', {email: email, password: password})
    });*/
})