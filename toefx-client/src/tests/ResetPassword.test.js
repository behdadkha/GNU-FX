import { mount, shallow } from 'enzyme';
import React from 'react';
import { config } from '../config';
import ResetPassword from '../components/user/ResetPassword';
import Axios from 'axios';

let allStates = 
    {
        currentPassword : "123", 
        newPassword1: "NewStrongPassword123", 
        newPassword2: "NewStrongPassword123", 
    };

describe("ResetPassword states", () => {

    it('initializes the states correctly', () => {
        const component = shallow(<ResetPassword />);

        expect(component.state('currentPassword')).toEqual("");
        expect(component.state('newPassword1')).toEqual("");
        expect(component.state('newPassword2')).toEqual("");
        expect(component.state('incorrectPasswordError')).toEqual(false);
        expect(component.state('passwordMismatchError')).toEqual(false);
        expect(component.state('emptyFieldError')).toEqual(false);
        expect(component.state('errorMsg')).toEqual("");
    });

});

describe("Resetpassword method: isAnyFieldLeftBlank", () => {

    it('all state have value', (done) => {
        const component = mount(<ResetPassword />);
        component.setState(allStates);
        expect(component.instance().isAnyFieldLeftBlank()).toEqual(false);
        done();
    });

    it('all state variables are empty', () => {
        const component = shallow(<ResetPassword />);
        expect(component.instance().isAnyFieldLeftBlank()).toEqual(true);
    });

    it('states newPassword1 and newPassword2 have a value(currentPassword is empty)', () => {
        const component = shallow(<ResetPassword />);
        component.setState({newPassword1 : "test", newPassword2: "somePasswordForTesting1234"});

        expect(component.instance().isAnyFieldLeftBlank()).toEqual(true);
    });

});

describe("ResetPassword method: passwordMismatch", () => {

    it('newPassword1 and newPassword2 are equal', () => {
        const component = shallow(<ResetPassword />);
        component.setState({newPassword1: "somerandompasswordtestingC2q", newPassword2: "somerandompasswordtestingC2q"});

        expect(component.instance().passwordMismatch()).toEqual(false);
    });
    
    it('newPassword1 and newPassword2 are not equal', () => {
        const component = shallow(<ResetPassword />);
        component.setState({newPassword1: "somerandompasswordtestingC2q", newPassword2: "123"});
        
        expect(component.instance().passwordMismatch()).toEqual(true);
    });

    it('newPassword1 and newPassword2 are empty', () => {
        const component = shallow(<ResetPassword />);

        component.setState({newPassword1: "", newPassword2: ""});
        expect(component.instance().passwordMismatch()).toEqual(false);
    });

    it('newPassword1 is empty', () => {
        const component = shallow(<ResetPassword />);

        component.setState({newPassword1: "", newPassword2: "abc"});
        expect(component.instance().passwordMismatch()).toEqual(true);
    });

});

describe("ResetPassword method: handleSubmit", () => {

    let component;
    let mockedHistory;
    beforeEach(() => {
        mockedHistory = {push: jest.fn()};
        component = shallow(<ResetPassword history={mockedHistory}/>);
    });

    it('Can successfully reset password', async () => {
        
        component.setState(allStates);
        Axios.post = jest.fn(() => Promise.resolve({status: 200, data : {msg: "password changed"}}));
        await component.instance().handleSubmit({preventDefault: () => {}});

        expect(Axios.post).toHaveBeenCalledTimes(1);
        expect(Axios.post).toHaveBeenCalledWith(`${config.dev_server}/user/resetPassword`, {
            currentPassword : "123", 
            newPassword1: "NewStrongPassword123", 
            newPassword2: "NewStrongPassword123", 
        });
        expect(mockedHistory.push).toHaveBeenCalledWith('/login');

    });

    it('Server error if incorrect password entered', async () => {
        const incorrectCredential = {currentPassword: "12345", newPassword1: "abc", newPassword2: "abc"};
        component.setState(incorrectCredential);
        Axios.post = jest.fn(() => Promise.resolve({data : {msg: "password incorrect"}}))
        await component.instance().handleSubmit({preventDefault: () => {}});
        expect(component.state('incorrectPasswordError')).toEqual(true);
        
    });

    it('State variables are empty', async () => {

        Axios.post = jest.fn(() => Promise.resolve({status: 200}));
        await component.instance().handleSubmit({preventDefault: () => {}});

        expect(component.state('emptyFieldError')).toEqual(true); //<----

    });

    it('new passwords dont match', async () => {
        const incorrectCredential = {currentPassword: "12345", newPassword1: "abcdef", newPassword2: "abc"};
        component.setState(incorrectCredential);

        Axios.post = jest.fn(() => Promise.resolve({status: 200}));
        await component.instance().handleSubmit({preventDefault: () => {}});
        expect(component.state('emptyFieldError')).toEqual(false);
        expect(component.state('incorrectPasswordError')).toEqual(false);
        expect(component.state('passwordMismatchError')).toEqual(true);

    });

});

describe("ResetPassword method: getErrorText", () => {

    it('emptyFieldError is true', () => {
        const component = shallow(<ResetPassword />);
        component.setState({emptyFieldError: true});
        expect(component.instance().getErrorText()).toEqual(<h6>Please fill in all fields.</h6>);
    });

    it('passwordMismatchError is true', () => {
        const component = shallow(<ResetPassword />);
        component.setState({passwordMismatchError: true});
        expect(component.instance().getErrorText()).toEqual(<h6>Please make sure passwords match.</h6>);
    });

    it('incorrectPasswordError is true', () => {
        const component = shallow(<ResetPassword />);
        component.setState({incorrectPasswordError: true});
        expect(component.instance().getErrorText()).toEqual(<h6>Your password is incorrect.</h6>);
    });
    
    it('No error state is set to true', () => {
        const component = shallow(<ResetPassword />);
        expect(component.instance().getErrorText()).toEqual("");
    });

});

describe("ResetPassword UI Functionalities", () => {

    let component, currentPassword, passwordField1, passwordField2;
    beforeEach(() => {
        component = shallow(<ResetPassword history={{push: jest.fn()}}/>);
        currentPassword = component.find('[type="password"]').at(0);
        passwordField1 = component.find('[type="password"]').at(1);
        passwordField2 = component.find('[type="password"]').at(2);
    });

    it("renders empty input fields", async() => {
        
        expect(currentPassword.props().value).toEqual("");
        expect(passwordField1.props().value).toEqual("");
        expect(passwordField2.props().value).toEqual("");

    });

    it("input fields are read and state variables are set accordingly", () => {
        
        currentPassword.simulate('change', {target: {value: allStates.currentPassword}});
        passwordField1.simulate('change', {target: {value: allStates.newPassword1}});
        passwordField2.simulate('change', {target: {value: allStates.newPassword2}});

        expect(component.state('currentPassword')).toEqual(allStates.currentPassword);
        expect(component.state('newPassword1')).toEqual(allStates.newPassword1);
        expect(component.state('newPassword2')).toEqual(allStates.newPassword2);

    });

    it("NewPasswords starts with white spaces", async() => {
        
        currentPassword.simulate('change', {target: {value: allStates.currentPassword}});
        passwordField1.simulate('change', {target: {value: " newpass"}});
        passwordField2.simulate('change', {target: {value: " newpass"}});

        await component.find('[test-id="resetPasswordFrom"]').simulate('submit', {
            preventDefault: () => {}
        })

        expect(Axios.post).toHaveBeenCalledTimes(0);// the post request is not called
        expect(component.state('errorMsg')).toEqual("Password can't start with a space");
        
    });

});