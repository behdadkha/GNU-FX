import { mount, shallow } from 'enzyme';
import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Provider } from "react-redux";
import Sidebar from '../components/user/Sidebar';
import store from '../Redux/store'
import * as authAction from '../Redux/Actions/authAction.js';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as deviceDetect from 'react-device-detect';
import { compose } from 'redux';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

import {config} from '../config'



describe("Side bar Bar UI", () => {
    let component, mockedHistory;
    beforeEach(() => {
        
        mockedHistory = { push: jest.fn() }
        component = mount(<Provider store={store}><Sidebar history={mockedHistory} /></Provider>);
    });

    it('Renders', () => {
        shallow(<Provider store={store}><Sidebar history={mockedHistory} /></Provider>);
    });


    it('clicking on Treatment Schedule redirects to /user/myAccount', () => {
        component.find('[test-id="myAccount"]').first().simulate('click');
        expect(mockedHistory.push).toHaveBeenCalledWith('/user/myAccount');
    });

    it('path = /user', () => {
        deviceDetect.isMobile = false;
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/user'
            }
        });
        window.location.pathname = "/user";
        component = mount(<Provider store={store}><Sidebar history={mockedHistory} /></Provider>);

        expect(component.find('[test-id="dashboardRow"]').first().props().className).toEqual("sidebar-items sidebar-active-item");
    });

    it('path = /user/myAccount', () => {

        window.location.pathname = "/user/myAccount";
        component = mount(<Provider store={store}><Sidebar history={mockedHistory} /></Provider>);

        expect(component.find('[test-id="dashboardRow"]').first().props().className).toEqual("sidebar-items");
        expect(component.find('[test-id="myAccountRow"]').first().props().className).toEqual("sidebar-items sidebar-active-item");
    });
    
});
//window.location.pathname = "/login";