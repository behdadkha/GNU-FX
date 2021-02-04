import { shallow } from 'enzyme';
import React from 'react';
import { config } from '../config';
import Signup from '../components/Signup';
import Axios from 'axios';


let allStates = 
    {
        name : "test", 
        email: "demo@gmail.com", 
        password: "somePasswordForTesting1234", 
        confirmedPassword: "somePasswordForTesting1234",
        age: "12"
    };

describe("Signup states", () => {

    it('initializes the states correctly', () => {
        const component = shallow(<Signup />);

        expect(component.state('name')).toEqual("");
        expect(component.state('email')).toEqual("");
        expect(component.state('password')).toEqual("");
        expect(component.state('confirmedPassword')).toEqual("");
        expect(component.state('age')).toEqual("");
        expect(component.state('accountExistsError')).toEqual(false);
        expect(component.state('passwordMismatchError')).toEqual(false);
        expect(component.state('emptyFieldError')).toEqual(false);
        expect(component.state('errorMessage')).toEqual("");
    });

});

describe("Signup method: isAnyFieldLeftBlank", () => {

    it('all state have value', () => {
        const component = shallow(<Signup />);
        component.setState(allStates);

        expect(component.instance().isAnyFieldLeftBlank()).toEqual(false);
    });

    it('all state variables are empty', () => {
        const component = shallow(<Signup />);
        expect(component.instance().isAnyFieldLeftBlank()).toEqual(true);
    });

    it('state name has a value', () => {
        const component = shallow(<Signup />);
        component.setState({name : "test"});

        expect(component.instance().isAnyFieldLeftBlank()).toEqual(true);
    });

    it('states name and password have a value', () => {
        const component = shallow(<Signup />);
        component.setState({name : "test", password: "somePasswordForTesting1234"});

        expect(component.instance().isAnyFieldLeftBlank()).toEqual(true);
    });

});

describe("Signup method: passwordMismatch", () => {

    it('password and confirmedPassword are equal', () => {
        const component = shallow(<Signup />);
        component.setState({password: "somePasswordForTesting1234", confirmedPassword: "somePasswordForTesting1234"});

        expect(component.instance().passwordMismatch()).toEqual(false);
    });
    
    it('password and confirmedPassword are not equal', () => {
        const component = shallow(<Signup />);
        component.setState({password: "somePasswordForTesting1234", confirmedPassword: "123"});
        
        expect(component.instance().passwordMismatch()).toEqual(true);
    });

    it('confirmedPassword is an empty string', () => {
        const component = shallow(<Signup />);

        component.setState({password: "somePasswordForTesting1234", confirmedPassword: ""});
        expect(component.instance().passwordMismatch()).toEqual(true);
    });

});

describe("Signup method: handleSignup", () => {

    let component;
    let mockedHistory;
    beforeEach(() => {
        mockedHistory = {push: jest.fn()};
        component = shallow(<Signup history={mockedHistory}/>);
    });

    it('Can successfully sign up a user', async () => {
        
        component.setState(allStates);
        Axios.post = jest.fn(() => Promise.resolve({status: 200}));
        await component.instance().handleSignup({preventDefault: () => {}});

        expect(Axios.post).toHaveBeenCalledTimes(1);
        expect(Axios.post).toHaveBeenCalledWith(`${config.dev_server}/signup`, {"age": "12", "email": "demo@gmail.com", "name": "test", "password": "somePasswordForTesting1234"});
        expect(mockedHistory.push).toHaveBeenCalledTimes(1);
        expect(mockedHistory.push).toHaveBeenCalledWith('/login');

    });

    it('Server returns status: 400', async () => {

        component.setState(allStates);

        Axios.post = jest.fn(() => Promise.resolve({status: 400}));
        await component.instance().handleSignup({preventDefault: () => {}});

        expect(component.state('emptyFieldError')).toEqual(false);
        expect(component.state('accountExistsError')).toEqual(true);//<----
        expect(component.state('passwordMismatchError')).toEqual(false);
       

    });

    it('Server returns status: 404', async () => {
        Axios.post = jest.fn(() => Promise.resolve({status: 404}));
        component.setState(allStates);

        Axios.post.mockRejectedValueOnce();
        await component.instance().handleSignup({preventDefault: () => {}});
        expect(component.state('accountExistsError')).toEqual(true);//<----
        
    });

    it('State variables are empty', async () => {

        Axios.post = jest.fn(() => Promise.resolve({status: 200}));
        await component.instance().handleSignup({preventDefault: () => {}});

        expect(component.state('emptyFieldError')).toEqual(true); //<----
        expect(component.state('accountExistsError')).toEqual(false);
        expect(component.state('passwordMismatchError')).toEqual(false);

    });

    it('password and confirm password dont match', async () => {

        component.setState(
            {
            name : "test", 
            email: "demo@gmail.com", 
            password: "somePasswordForTesting1234", 
            confirmedPassword: "Somethingelse",
            age: "12"
            }
        );

        Axios.post = jest.fn(() => Promise.resolve({status: 200}));
        await component.instance().handleSignup({preventDefault: () => {}});

        expect(component.state('emptyFieldError')).toEqual(false);
        expect(component.state('accountExistsError')).toEqual(false);
        expect(component.state('passwordMismatchError')).toEqual(true);//<----

    });

});


describe("Signup method: getErrorText", () => {

    it('emptyFieldError is true', () => {
        const component = shallow(<Signup />);
        component.setState({emptyFieldError: true});

        expect(component.instance().getErrorText()).toEqual(<h6>Please fill in all fields.</h6>);
    });

    it('passwordMismatchError is true', () => {
        const component = shallow(<Signup />);
        component.setState({passwordMismatchError: true});

        expect(component.instance().getErrorText()).toEqual(<h6>Please make sure passwords match.</h6>);
    });


    it('accountExistsError is true', () => {
        const component = shallow(<Signup />);
        component.setState({accountExistsError: true});

        expect(component.instance().getErrorText()).toEqual(<h6>That email is already in use. Please choose another.</h6>);
    });
    
    it('No error state is set to true', () => {
        const component = shallow(<Signup />);

        expect(component.instance().getErrorText()).toEqual("");
    });

});

describe("Signup UI Functionalities", () => {

    let component, emailField, passwordField, confirmedPassword, fullName, age;
    beforeEach(() => {
        component = shallow(<Signup history={{push: jest.fn()}}/>);
        emailField = component.find('[type="email"]').first();
        passwordField = component.find('[type="password"]').first();
        confirmedPassword = component.find('[type="password"]').at(1);
        fullName = component.find('[type="text"]').at(0);
        age = component.find('[type="number"]').at(0);
    });

    it("renders empty input fields", async() => {
        
        expect(emailField.props().value).toEqual("");
        expect(passwordField.props().value).toEqual("");
        expect(confirmedPassword.props().value).toEqual("");
        expect(fullName.props().value).toEqual("");
        expect(age.props().value).toEqual("");

    });

    it("input fields are read and state variables are set accordingly", async() => {
        
        emailField.simulate('change', {target: {value: allStates.email}});
        passwordField.simulate('change', {target: {value: allStates.password}});
        confirmedPassword.simulate('change', {target: {value: allStates.confirmedPassword}});
        fullName.simulate('change', {target: {value: allStates.fullName}});
        age.simulate('change', {target: {value: allStates.age}});

        expect(component.state('name')).toEqual(allStates.fullName);
        expect(component.state('email')).toEqual(allStates.email);
        expect(component.state('password')).toEqual(allStates.password);
        expect(component.state('confirmedPassword')).toEqual(allStates.confirmedPassword);
        expect(component.state('age')).toEqual(allStates.age);

    });

    it("Invalid email format", async() => {
        
        emailField.simulate('change', {target: {value: "some55gmail.com"}});
        passwordField.simulate('change', {target: {value: allStates.password}});
        confirmedPassword.simulate('change', {target: {value: allStates.confirmedPassword}});
        fullName.simulate('change', {target: {value: allStates.fullName}});
        age.simulate('change', {target: {value: allStates.age}});

        await component.find('.signup-form').simulate('submit', {
            preventDefault: () => {}
        })

        expect(Axios.post).toHaveBeenCalledTimes(0);// the post request is not called
        expect(component.state('errorMessage')).toEqual("Invalid Email Address");
        
    });

    it("password starts with white spaces", async() => {
        
        emailField.simulate('change', {target: {value: "  some@gmail.com"}});
        passwordField.simulate('change', {target: {value: "  23A password"}});
        confirmedPassword.simulate('change', {target: {value: "  23A password"}});
        fullName.simulate('change', {target: {value: allStates.fullName}});
        age.simulate('change', {target: {value: allStates.age}});

        await component.find('.signup-form').simulate('submit', {
            preventDefault: () => {}
        })

        expect(Axios.post).toHaveBeenCalledTimes(0);// the post request is not called
        expect(component.state('errorMessage')).toEqual("Invalid Email Address");
        
    });

    it("password starts with white spaces", async() => {
        
        emailField.simulate('change', {target: {value: allStates.email}});
        passwordField.simulate('change', {target: {value: "  23A password"}});
        confirmedPassword.simulate('change', {target: {value: "  23A password"}});
        fullName.simulate('change', {target: {value: allStates.fullName}});
        age.simulate('change', {target: {value: allStates.age}});

        await component.find('.signup-form').simulate('submit', {
            preventDefault: () => {}
        })

        expect(Axios.post).toHaveBeenCalledTimes(0);// the post request is not called
        expect(component.state('errorMessage')).toEqual("Invalid Password");
        
    });

});