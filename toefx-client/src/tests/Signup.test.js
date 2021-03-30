import { mount, shallow } from 'enzyme';
import React from 'react';
import { config } from '../config';
import Signup from '../components/Signup';
import Axios from 'axios';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let allStates = 
    {
        name : "test lastname", 
        email: "demo@gmail.com", 
        password: "somePasswordForTesting1234", 
        confirmedPassword: "somePasswordForTesting1234",
        age: "12",
        birthday: new Date()
    };

describe("Signup states", () => {

    it('initializes the states correctly', () => {
        const store = mockStore({ auth: { isAuth: false } });
        let component = mount(<Provider store={store}><Signup /></Provider>);
        component = component.find(Signup).children();

        expect(component.state('name')).toEqual("");
        expect(component.state('email')).toEqual("");
        expect(component.state('password')).toEqual("");
        expect(component.state('confirmedPassword')).toEqual("");
        expect(component.state('errorMessage')).toEqual("");
        expect(component.state('birthday')).toEqual("");
        expect(component.state('successMessage')).toEqual("");
    });

});

describe("Signup method: isAnyFieldLeftBlank", () => {
    let component
    beforeEach(() => {
        const store = mockStore({ auth: { isAuth: false } });
        component  = mount(<Provider store={store}><Signup /></Provider>);
        component = component.find(Signup).children();
    });

    it('all states have value', () => {
        component.setState(allStates);
        expect(component.instance().isAnyFieldLeftBlank()).toEqual(false);
    });

    it('all state variables are empty', () => {
        expect(component.instance().isAnyFieldLeftBlank()).toEqual(true);
    });

    it('state name has a value', () => {
        component.setState({name : "test"});
        expect(component.instance().isAnyFieldLeftBlank()).toEqual(true);
    });

    it('states name and password have a value', () => {
        component.setState({name : "test", password: "somePasswordForTesting1234"});
        expect(component.instance().isAnyFieldLeftBlank()).toEqual(true);
    });

});

describe("Signup method: passwordMismatch", () => {
    let component
    beforeEach(() => {
        const store = mockStore({ auth: { isAuth: false } });
        component  = mount(<Provider store={store}><Signup /></Provider>);
        component = component.find(Signup).children();
    });

    it('password and confirmedPassword are equal', () => {
        component.setState({password: "somePasswordForTesting1234", confirmedPassword: "somePasswordForTesting1234"});
        expect(component.instance().passwordMismatch()).toEqual(false);
    });
    
    it('password and confirmedPassword are not equal', () => {
        component.setState({password: "somePasswordForTesting1234", confirmedPassword: "123"});
        expect(component.instance().passwordMismatch()).toEqual(true);
    });

    it('confirmedPassword is an empty string', () => {
        component.setState({password: "somePasswordForTesting1234", confirmedPassword: ""});
        expect(component.instance().passwordMismatch()).toEqual(true);
    });

});

describe("Signup method: handleSignup", () => {

    let component;
    beforeEach(() => {
        const store = mockStore({ auth: { isAuth: false } });
        component  = mount(<Provider store={store}><Signup /></Provider>);
        component = component.find(Signup).children();
    });

    it('Can successfully sign up a user', async () => {
        
        component.setState(allStates);
        Axios.post = jest.fn(() => Promise.resolve({status: 200}));
        await component.instance().handleSignup({preventDefault: () => {}});

        expect(Axios.post).toHaveBeenCalledTimes(1);
        expect(Axios.post).toHaveBeenCalledWith(`${config.dev_server}/signup`, {"email": "demo@gmail.com", "name": "test lastname", "password": "somePasswordForTesting1234","birthday": new Date().toJSON().split("T")[0]});

    });

    it('Server returns status: 400', async () => {

        component.setState(allStates);

        Axios.post = jest.fn(() => Promise.resolve({status: 400}));
        await component.instance().handleSignup({preventDefault: () => {}});

        expect(component.state('errorMessage')).toEqual("ACCOUNT_EXISTS");

    });

    it('Server returns status: 404', async () => {
        Axios.post = jest.fn(() => Promise.resolve({status: 404}));
        component.setState(allStates);

        Axios.post.mockRejectedValueOnce();
        await component.instance().handleSignup({preventDefault: () => {}});
        expect(component.state('errorMessage')).toEqual("ACCOUNT_EXISTS");
        
    });

    it('State variables are empty', async () => {

        Axios.post = jest.fn(() => Promise.resolve({status: 200}));
        await component.instance().handleSignup({preventDefault: () => {}});

        expect(component.state('errorMessage')).toEqual("BLANK_FIELD");

    });

    it('password and confirm password dont match', async () => {

        component.setState(
            {
                name : "test lastname", 
                email: "demo@gmail.com", 
                password: "somePassword123", 
                confirmedPassword: "somePasswordForTesting1234",
                age: "12",
                birthday: new Date()
            }
        );

        Axios.post = jest.fn(() => Promise.resolve({status: 200}));
        await component.instance().handleSignup({preventDefault: () => {}});

        expect(component.state('errorMessage')).toEqual("PASSWORD_MISMATCH");

    });

});


describe("Signup method: getErrorText", () => {
    let component
    beforeEach(() => {
        const store = mockStore({ auth: { isAuth: false } });
        component  = mount(<Provider store={store}><Signup /></Provider>);
        component = component.find(Signup).children();
    });

    it('emptyFieldError is true', () => {
        component.setState({errorMessage: "BLANK_FIELD"});
        expect(component.instance().getErrorText()).toEqual("Please fill in all fields.");
    });

    it('passwordMismatchError is true', () => {
        component.setState({errorMessage: "PASSWORD_MISMATCH"});
        expect(component.instance().getErrorText()).toEqual("Please make sure passwords match.");
    });


    it('accountExistsError is true', () => {
        component.setState({errorMessage: "ACCOUNT_EXISTS"});
        expect(component.instance().getErrorText()).toEqual("That email is already in use.\nPlease choose another.");
    });
    
    it('No error state is set to true', () => {
        expect(component.instance().getErrorText()).toEqual("");
    });

});