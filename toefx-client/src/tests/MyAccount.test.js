import { mount, shallow } from 'enzyme';
import React from 'react';
import { AccordionCollapse, Nav, Navbar } from 'react-bootstrap';
import { Provider } from "react-redux";
import MyAccount from '../components/user/MyAccount';
import store from '../Redux/store'
import * as setFootAction from '../Redux/Actions/setFootAction'

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { SetCurrentUser } from '../Redux/Actions/authAction';
import Axios from 'axios';
import { config } from '../config';
import * as utils from "../Utils";
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('MyAccount component', () => {
    
    describe('component initialization', () => {

        it('state variables are initialized correctly', () => {
            const mockedHistory = { push: jest.fn() }
            Axios.get = jest.fn(() => Promise.resolve());
            const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
            let component = mount(<Provider store={store}><MyAccount history={mockedHistory} /></Provider>);
            component = component.find(MyAccount).children();

            expect(component.state('email')).toBe("");
            expect(component.state('age')).toBe(0);
            expect(component.state('imageUrls')).toEqual([]);
            expect(component.state('toeData')).toEqual([]);
            expect(component.state('showLeftFoot')).toBe(true);
        })

        it('requests the data from the server', () => {
            const mockedHistory = { push: jest.fn() }
            Axios.get = jest.fn(() => Promise.resolve({data: {name: "tester"}}));
            //const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
            store.dispatch = jest.fn();
            let component = mount(<Provider store={store}><MyAccount history={mockedHistory} /></Provider>);
            component = component.find(MyAccount).children();
            
        })

    });

    it('navigateToResetPasswordPage', () => {
        const mockedHistory = { push: jest.fn() }
        Axios.get = jest.fn(() => Promise.resolve());
        const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
        let component = mount(<Provider store={store}><MyAccount history={mockedHistory} /></Provider>);
        component = component.find(MyAccount).children();

        component.instance().navigateToResetPasswordPage()
        expect(mockedHistory.push).toHaveBeenCalledWith('/user/resetPassword');

    })

    describe('viewFoot method', () => {
        it('sets showLeftFoot to true', () => {

            Axios.get = jest.fn(() => Promise.resolve());
            const mockedHistory = { push: jest.fn() }
            const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
            let component = mount(<Provider store={store}><MyAccount history={mockedHistory} /></Provider>);
            component = component.find(MyAccount).children();
            component.instance().viewFoot(true);

            expect(component.state('showLeftFoot')).toEqual(true);
        })

    })

    describe('deleteImage method', () => {
        afterEach(() => {
            Axios.get.mockRestore();
        });
        it('calls Axios with the correct data', () => {
            window.location.reload = jest.fn();
            Axios.get = jest.fn(() => Promise.resolve());
            const mockedHistory = { push: jest.fn() }
            const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
            let component = mount(<Provider store={store}><MyAccount history={mockedHistory} /></Provider>);
            component = component.find(MyAccount).children();
            component.instance().deleteImage("firtImage", 0, 2, 0);

            expect(Axios.get).toHaveBeenCalledWith(`${config.dev_server}/deleteImage?footIndex=${0}&toeIndex=${2}&imageIndex=${0}&imageName=firtImage`);
        })

        it('selectedFootIndex = 10 out of range', () => {
            window.location.reload = jest.fn();
            Axios.get = jest.fn(() => Promise.resolve());
            const mockedHistory = { push: jest.fn() }
            const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
            let component = mount(<Provider store={store}><MyAccount history={mockedHistory} /></Provider>);
            component = component.find(MyAccount).children();
            component.instance().deleteImage("firtImage", 0, 10, 0);

            expect(window.location.reload).toHaveBeenCalledTimes(0)
        })

        it('toeIndex = 10 and selectedFootIndex = 9 out of range', () => {
            window.location.reload = jest.fn();
            Axios.get = jest.fn(() => Promise.resolve());
            const mockedHistory = { push: jest.fn() }
            const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
            let component = mount(<Provider store={store}><MyAccount history={mockedHistory} /></Provider>);
            component = component.find(MyAccount).children();
            component.instance().deleteImage("firtImage", 0, 10, 0);

            expect(window.location.reload).toHaveBeenCalledTimes(0)
        })

        it('server rejects', () => {
            window.location.reload = jest.fn();
            Axios.get = jest.fn();
            Axios.get.mockRejectedValueOnce();
            const mockedHistory = { push: jest.fn() }
            const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
            let component = mount(<Provider store={store}><MyAccount history={mockedHistory} /></Provider>);
            component = component.find(MyAccount).children();
            component.instance().deleteImage("firtImage", 0, 1, 0);
            
        })
    })

    describe('printUploadedImage method', () => {
        it('works', () => {
            
            window.location.reload = jest.fn();
            Axios.get = jest.fn(() => Promise.resolve());
            const mockedHistory = { push: jest.fn() }
            const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
            let component = mount(<Provider store={store}><MyAccount history={mockedHistory} /></Provider>);
            component = component.find(MyAccount).children();
            jest.spyOn(utils, 'GetImageSrcByURLsAndName');
            jest.spyOn(utils, 'GetToeName');
            component.setState({imageUrls: [{imageName: "this.png"}]});
            component.instance().printUploadedImage(1 ,{images: [{name: "this.png", date: "2020-11-20", fungalCoverage: "2%"}]}, 1);


            expect(utils.GetImageSrcByURLsAndName).toHaveBeenCalled();
            expect(utils.GetToeName).toHaveBeenCalled();
        })

        it('invalid date is given', () => {
            
            window.location.reload = jest.fn();
            Axios.get = jest.fn(() => Promise.resolve());
            const mockedHistory = { push: jest.fn() }
            const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
            let component = mount(<Provider store={store}><MyAccount history={mockedHistory} /></Provider>);
            component = component.find(MyAccount).children();
            jest.spyOn(utils, 'GetImageSrcByURLsAndName');
            jest.spyOn(utils, 'GetToeName');
            component.setState({imageUrls: [{imageName: "this.png"}]});
            component.instance().printUploadedImage(1 ,{images: [{name: "this.png", date: "2020-11-20TD", fungalCoverage: "2%"}]}, 1);


            expect(utils.GetImageSrcByURLsAndName).toHaveBeenCalled();
            expect(utils.GetToeName).toHaveBeenCalled();
        })
        
    })
    
    



})
