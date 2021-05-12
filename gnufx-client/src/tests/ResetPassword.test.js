import { mount, shallow } from 'enzyme';
import React from 'react';
import { config } from '../config';
import ResetPassword from '../components/user/ResetPassword';
import Axios from 'axios';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let allStates = 
    {
        currentPassword : "123", 
        newPassword: "NewStrongPassword123", 
        confirmNewPassword: "NewStrongPassword123", 
    };

describe("ResetPassword states", () => {

    it('initializes the states correctly', () => {
        const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
        let component = mount(<Provider store={store}><ResetPassword /></Provider>);
        component = component.find(ResetPassword).children();

        expect(component.state('currentPassword')).toEqual("");
        expect(component.state('newPassword')).toEqual("");
        expect(component.state('confirmNewPassword')).toEqual("");
        expect(component.state('successMessage')).toEqual("");
        expect(component.state('errorMsg')).toEqual("");
    });

});

describe("Resetpassword method: isAnyFieldLeftBlank", () => {
    let component;
    beforeEach(() => {
        const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
        component = mount(<Provider store={store}><ResetPassword /></Provider>);
        component = component.find(ResetPassword).children();
    });
    it('all state have value', (done) => {
        component.setState(allStates);
        expect(component.instance().isAnyFieldLeftBlank()).toEqual(false);
        done();
    });

    it('all state variables are empty', () => {
        expect(component.instance().isAnyFieldLeftBlank()).toEqual(true);
    });

    it('states newPassword1 and newPassword2 have a value(currentPassword is empty)', () => {
        component.setState({newPassword : "test", confirmNewPassword: "somePasswordForTesting1234"});

        expect(component.instance().isAnyFieldLeftBlank()).toEqual(true);
    });

});

describe("ResetPassword method: passwordMismatch", () => {
    let component;
    beforeEach(() => {
        const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
        component = mount(<Provider store={store}><ResetPassword /></Provider>);
        component = component.find(ResetPassword).children();
    });

    it('newPassword and confirmNewPassword are equal', () => {
        component.setState({newPassword: "somerandompasswordtestingC2q", confirmNewPassword: "somerandompasswordtestingC2q"});
        expect(component.instance().passwordMismatch()).toEqual(false);
    });
    
    it('newPassword and confirmNewPassword are not equal', () => {
        component.setState({newPassword1: "somerandompasswordtestingC2q", confirmNewPassword: "123"});
        expect(component.instance().passwordMismatch()).toEqual(true);
    });

    it('newPassword and confirmNewPassword are empty', () => {
        component.setState({newPassword1: "", confirmNewPassword: ""});
        expect(component.instance().passwordMismatch()).toEqual(false);
    });

    it('newPassword is empty', () => {
        component.setState({newPassword: "", confirmNewPassword: "abc"});
        expect(component.instance().passwordMismatch()).toEqual(true);
    });

});

describe("ResetPassword method: handlePasswordChange", () => {

    let component;
    beforeEach(() => {
        const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
        component = mount(<Provider store={store}><ResetPassword /></Provider>);
        component = component.find(ResetPassword).children();
    });

    it('Can successfully reset password', async () => {
        
        component.setState(allStates);
        Axios.post = jest.fn(() => Promise.resolve({status: 200, data : {msg: "password changed"}}));
        await component.instance().handlePasswordChange({preventDefault: () => {}});

        expect(Axios.post).toHaveBeenCalledTimes(1);
        expect(Axios.post).toHaveBeenCalledWith(`${config.dev_server}/user/resetPassword`, {
            currentPassword : "123",  
            newPassword: "NewStrongPassword123", 
        });


    });

    it('Server error if incorrect password entered', async () => {
        const incorrectCredential = {currentPassword: "12345", newPassword: "abc", confirmNewPassword: "abc"};
        component.setState(incorrectCredential);
        Axios.post = jest.fn(() => Promise.resolve({data : {msg: "password incorrect"}}))
        await component.instance().handlePasswordChange({preventDefault: () => {}});
        expect(component.state('errorMessage')).toEqual("INVALID_PASSWORD");
        
    });

    it('State variables are empty', async () => {

        Axios.post = jest.fn(() => Promise.resolve({status: 200}));
        await component.instance().handlePasswordChange({preventDefault: () => {}});

        expect(component.state('errorMessage')).toEqual("BLANK_FIELD");

    });

    it('new passwords dont match', async () => {
        const incorrectCredential = {currentPassword: "12345", newPassword: "abcdef", confirmNewPassword: "abc"};
        component.setState(incorrectCredential);

        Axios.post = jest.fn(() => Promise.resolve({status: 200}));
        await component.instance().handlePasswordChange({preventDefault: () => {}});
        expect(component.state('errorMessage')).toEqual("PASSWORD_MISMATCH");

    });

});

describe("ResetPassword method: getErrorText", () => {
    let component;
    beforeEach(() => {
        const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
        component = mount(<Provider store={store}><ResetPassword /></Provider>);
        component = component.find(ResetPassword).children();
    });

    it('emptyFieldError is true', () => {
        component.setState({errorMessage: "BLANK_FIELD"});
        expect(component.instance().getErrorText()).toEqual("Please fill in all fields.");
    });

    it('passwordMismatchError is true', () => {
        component.setState({errorMessage: "PASSWORD_MISMATCH"});
        expect(component.instance().getErrorText()).toEqual("Please make sure new passwords match.");
    });

    it('incorrectPasswordError is true', () => {
        component.setState({errorMessage: "INVALID_PASSWORD"});
        expect(component.instance().getErrorText()).toEqual("Please enter a valid password.");
    });

});

