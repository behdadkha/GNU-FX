import { mount } from 'enzyme';
import React from 'react';
import { Provider } from "react-redux";
import Schedule from '../components/user/Schedule';
import store from '../Redux/store'

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Axios from 'axios';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Schedule component', () => {
    it('correct initialization of the state variables', () => {
        let component = mount(<Provider store={store}><Schedule /></Provider>);
        component = component.find(Schedule).children();

        expect(component.state('scheduleData')).toEqual([]);
    });

    describe('printDate', () => {
        it('prints out a row', () => {
            let component = mount(<Provider store={store}><Schedule /></Provider>);
            component = component.find(Schedule).children();
            const instance = component.instance();

            const output = instance.printDate(10, { date: "2020-10-10", doctor: "Mr. tester", comment: "very good" });

            expect(output.props.children[1].props.children).toEqual('2020-10-10');
            expect(output.props.children[2].props.children).toEqual("Mr. tester");
            expect(output.props.children[3].props.children).toEqual("very good");
        });
    })

    describe('CompunentDidMount', () => {
        it('calls the server to get users schedule', () => {
            let mockedHistory = { push: jest.fn() };
            Axios.get = jest.fn(() => Promise.resolve({ data: [{ date: "2020-10-10", doctor: "Mr. tester", comment: "very good" }] }));
            const store = mockStore({ auth: { isAuth: true } });

            mount(<Provider store={store}><Schedule history={mockedHistory} /></Provider>);

            expect(Axios.get).toHaveBeenCalledWith("http://localhost:3001/user/getschedule");
        });

        it('doesnt request the schedule data if the user is not logged in', () => {
            let mockedHistory = { push: jest.fn() };
            Axios.get = jest.fn(() => Provider.resolve({ data: { date: "2020-10-10", doctor: "Mr. tester", comment: "very good" } }));

            mount(<Provider store={store}><Schedule history={mockedHistory} /></Provider>);

            expect(Axios.get).toHaveBeenCalledTimes(0);
            expect(mockedHistory.push).toHaveBeenCalledWith('/Login');
        });

    })

    it('schedule data is loaded', () => {
        let mockedHistory = { push: jest.fn() };
        Axios.get = jest.fn(() => Promise.resolve({ data: [{ date: "2020-10-10", doctor: "Mr. tester", comment: "very good" }] }));
        const store = mockStore({ auth: { isAuth: true } });

        let component = mount(<Provider store={store}><Schedule history={mockedHistory} /></Provider>);
        component.find(Schedule).children().setState({scheduleData: [{ date: "2020-10-10", doctor: "Mr. tester", comment: "very good" }]});

        expect(component.find(Schedule).children().state('scheduleData')).toEqual([{ date: "2020-10-10", doctor: "Mr. tester", comment: "very good" }]);
    });

    it('schedule data is still not loaded', () => {
        let mockedHistory = { push: jest.fn() };
        Axios.get = jest.fn(() => Promise.resolve({ data: [{ date: "2020-10-10", doctor: "Mr. tester", comment: "very good" }] }));
        const store = mockStore({ auth: { isAuth: true } });

        let component = mount(<Provider store={store}><Schedule history={mockedHistory} /></Provider>);
        component.find(Schedule).children().setState({scheduleData: []});
        


    });

    it('server responds with 400', () => {
        let mockedHistory = { push: jest.fn() };
        Axios.get = jest.fn(() => Promise.reject({status: 404, data: [{ date: "2020-10-10", doctor: "Mr. tester", comment: "very good" }] }));
        const store = mockStore({ auth: { isAuth: true } });

        let component = mount(<Provider store={store}><Schedule history={mockedHistory} /></Provider>);

        expect(component.find(Schedule).children().instance).toThrow();//throws exception
    });

})
