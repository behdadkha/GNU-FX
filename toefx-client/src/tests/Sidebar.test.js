import { mount, shallow } from 'enzyme';
import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Provider } from "react-redux";
import Sidebar from '../components/user/Sidebar';
import store from '../Redux/store'
import * as authAction from '../Redux/Actions/authAction.js';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Side bar Bar UI", () => {
    it('Renders', () => {
        let mockedHistory = {push: jest.fn()}
        shallow(<Provider store={store}><Sidebar history={mockedHistory}/></Provider>);
    });

    it('clicking on upload image redirects to /upload', () => {
        let mockedHistory = {push: jest.fn()}
        window.location.reload = jest.fn();
        let component = mount(<Provider store={store}><Sidebar history={mockedHistory}/></Provider>);
        component.find('.uploadButton').first().simulate('click');
        expect(mockedHistory.push).toHaveBeenCalledWith('/upload');
    });
    

    it('clicking on logout button removes the user and redirects to /', () => {
        let mockedHistory = {push: jest.fn()}
        jest.spyOn(authAction, 'LogOutUser');
        let component = mount(<Provider store={store}><Sidebar history={mockedHistory}/></Provider>);
        component.find('[test-id="logOut"]').first().simulate('click');
        expect(authAction.LogOutUser).toHaveBeenCalled();
    });
});