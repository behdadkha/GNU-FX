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
            expect(component.state('imageUrls')).toEqual([]);
            expect(component.state('toeData')).toEqual({"feet": [{}, {}]});
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

    })

    describe('viewFoot method', () => {
        it('sets showLeftFoot to true', () => {

            Axios.get = jest.fn(() => Promise.resolve());
            const mockedHistory = { push: jest.fn() }
            const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
            let component = mount(<Provider store={store}><MyAccount history={mockedHistory} /></Provider>);
            component = component.find(MyAccount).children();
            component.instance().viewFoot(1);

            expect(component.state('selectedFootIndex')).toEqual(1);
        })

    })

    describe('deleteImage method', () => {
        
        let component;

        afterEach(() => {
            Axios.get.mockRestore();
        });

        beforeEach(() => {
            window.location.reload = jest.fn();
            Axios.get = jest.fn(() => Promise.resolve());
            const mockedHistory = { push: jest.fn() }
            const store = mockStore({ auth: { isAuth: true, user: { name: "tester" } } });
            component = mount(<Provider store={store}><MyAccount history={mockedHistory} /></Provider>);
            component = component.find(MyAccount).children();
            
        });
        it('calls Axios with the correct data', () => {
            component.setState({
                toDeleteInfo: {
                    selectedFootIndex: 0,
                    toeIndex: 2,
                    imageIndex: 0,
                    imageName: "firstImage"
                }
            })
            component.instance().deleteImage();
            expect(Axios.get).toHaveBeenNthCalledWith(2,`${config.dev_server}/deleteImage?footIndex=${0}&toeIndex=${2}&imageIndex=${0}&imageName=firstImage`);
        })

        it('selectedFootIndex = 10 out of range', () => {
            component.setState({
                toDeleteInfo: {
                    selectedFootIndex: 0,
                    toeIndex: 10,
                    imageIndex: 0,
                    imageName: "firstImage"
                }
            })
            component.instance().deleteImage();
            expect(component.instance).toThrow();
        })

        it('toeIndex = 10 and selectedFootIndex = 9 out of range', () => {
            component.setState({
                toDeleteInfo: {
                    selectedFootIndex: 9,
                    toeIndex: 10,
                    imageIndex: 0,
                    imageName: "firstImage"
                }
            })

            component.instance().deleteImage();
            expect(component.instance).toThrow();
        })

        it('on server reject', () => {
            window.location.reload = jest.fn();
            Axios.get = jest.fn();
            Axios.get.mockRejectedValueOnce();
            component.setState({
                toDeleteInfo: {
                    selectedFootIndex: 9,
                    toeIndex: 10,
                    imageIndex: 0,
                    imageName: "firstImage"
                }
            })
            component.instance().deleteImage();
            expect(component.instance).toThrow();
            
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
            jest.spyOn(utils, 'GetImageURLByName');
            jest.spyOn(utils, 'GetToeSymbolImage');
            component.setState({imageUrls: [{imageName: "this.png"}]});
            component.instance().printUploadedImage(1, true, "imagename", "2020-11-20", "10%",1);


            expect(utils.GetImageURLByName).toHaveBeenCalled();
            expect(utils.GetToeSymbolImage).toHaveBeenCalled();
        })
        
    })
    
    



})
