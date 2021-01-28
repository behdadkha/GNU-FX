import { mount, shallow } from 'enzyme';
import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Provider } from "react-redux";
import NavigationBar from '../components/NavigationBar';
import store from '../Redux/store'
import * as authAction from '../Redux/Actions/authAction.js';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Navigation Bar UI", () => {
    global.window = Object.create(window);
    Object.defineProperty(window, 'location', {
        value: {
            pathname: '/'
        }
    });

    

    it('Renders correctly for /', () => {
        const store = mockStore({ auth: { isAuth: true } })
        let component = mount(<Provider store={store}><NavigationBar /></Provider>);
        expect(component.exists("Navbar")).toBe(true)

    });

    it('Renders correctly for /login', () => {
        const store = mockStore({ auth: { isAuth: true } })
        window.location.pathname = "/login";
        let component = mount(<Provider store={store}><NavigationBar /></Provider>);
        expect(component.exists("Navbar")).toBe(true)

    });

    it('Renders correctly for /signup', () => {
        const store = mockStore({ auth: { isAuth: true } })
        window.location.pathname = "/signup";
        let component = mount(<Provider store={store}><NavigationBar /></Provider>);
        expect(component.exists("Navbar")).toBe(true)

    });

    it('Renders correctly for /upload', () => {
        const store = mockStore({ auth: { isAuth: true }, })
        let component = mount(<Provider store={store}><NavigationBar /></Provider>);
        expect(component.exists("Navbar")).toBe(true)

    });

    it('does not render navbar for /user', () => {
        const store = mockStore({ auth: { isAuth: true } })
        window.location.pathname = "/user";
        let component = mount(<Provider store={store}><NavigationBar /></Provider>);
        expect(component.exists("Navbar")).toBe(false)


    });
    it('shows dashboard and logout when user is logged in', () => {
        const store = mockStore({ auth: { isAuth: true } })
        window.location.pathname = "/";
        let component = mount(<Provider store={store}><NavigationBar /></Provider>);
        expect(component.exists("Navbar")).toBe(true);
        expect(component.contains
            (
                <Nav.Link href="/user">
                    Dashboard
                </Nav.Link>
            )
        ).toBe(true)

        expect(component.text()).toEqual("ToeFXHomeDiagnosisLog OutDashboard")

    });

    it('shows login and sign out when user is not logged in', () => {

        const store = mockStore({ auth: { isAuth: false } })
        let component = mount(<Provider store={store}><NavigationBar /></Provider>);
        expect(component.exists("Navbar")).toBe(true);
        expect(component.contains
            (
                <Nav>
                    <Nav.Link href="/signup">Sign Up</Nav.Link>
                    <Nav.Link href="/login">Login</Nav.Link>
                </Nav>
            )
        ).toBe(true)

    });

    it('shows login in /signup when not logged in', () => {

        const store = mockStore({ auth: { isAuth: false } })
        window.location.pathname = "/signup";
        let component = mount(<Provider store={store}><NavigationBar /></Provider>);
        expect(component.exists("Navbar")).toBe(true);
        expect(component.contains
            (
                <Nav>
                    <Nav.Link href="/login">Login</Nav.Link>
                </Nav>
            )
        ).toBe(true)

    });

    it('shows signup in /login when not logged in', () => {

        const store = mockStore({ auth: { isAuth: false } })
        window.location.pathname = "/login";
        let component = mount(<Provider store={store}><NavigationBar /></Provider>);
        expect(component.exists("Navbar")).toBe(true);
        expect(component.contains
            (
                <Nav>
                    <Nav.Link href="/signup">Sign Up</Nav.Link>
                </Nav>
            )
        ).toBe(true)

    });

    it('log out button calls store distpatch to remove user and redirects to /', async () => {

        const store = mockStore({ auth: { isAuth: true } })
        jest.spyOn(authAction, 'LogOutUser');
        let component = mount(<Provider store={store}><NavigationBar /></Provider>);
        
        component.find('[test-id="logOut"]').first().simulate('click');
        expect(authAction.LogOutUser).toHaveBeenCalled();
    });


});