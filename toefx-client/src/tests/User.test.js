import { mount, shallow } from 'enzyme';
import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Provider } from "react-redux";
import User from '../components/user/User';
import store from '../Redux/store'
import * as setFootAction from '../Redux/Actions/setFootAction'

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { SetCurrentUser } from '../Redux/Actions/authAction';
import Axios from 'axios';
import { config } from '../config';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


const images = [{ url: "some" }]
const toeData = [
    {
        toes: [
            { images: [{ name: "this.png" }] },
            { images: [] },
            { images: [] },
            { images: [] },
            { images: [] }
        ]
    }
];
describe("Testing User.js constructor", () => {
    let component, mockedHistory;
    beforeEach(() => {
        mockedHistory = { push: jest.fn() }
        component = shallow(<User store={store} history={mockedHistory} />).dive().dive();
    });

    it("all states are initialized correctly", () => {
        expect(component.state('selectedTreatment')).toEqual(0);
        expect(component.state('selectedTreatment')).toEqual(0);
        expect(component.state('rightFootData').length).toEqual(0);
        expect(component.state('leftFootData').length).toEqual(0);
        expect(component.state('leftFootDates').length).toEqual(0);
        expect(component.state('rightFootDates').length).toEqual(0);
        expect(component.state('toeData')).toEqual({});
        expect(component.state('imageUrls').length).toEqual(0);
        expect(component.state('dataLoaded')).toEqual(false);
    });

});

describe("Testing componentDidMount", () => {
    let component, mockedHistory;
    beforeEach(() => {
        mockedHistory = { push: jest.fn() }
    });

    it("redirects to the main page if not logged in", () => {
        const store = mockStore({ auth: { isAuth: false }, foot: { selectedFoot: 0 } })
        component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);

        expect(mockedHistory.push).toHaveBeenCalledWith('/login');
    });

    it("should call redux store to get toe data and images if currently dont exist", (done) => {
        //const stores = mockStore({ auth: { isAuth: true }, foot: {selectedFoot: 0, images: [], toeData: []} })
        Axios.get = jest.fn(() => Promise.resolve({data: []}));
        store.dispatch(SetCurrentUser("someone"));
        jest.spyOn(setFootAction, 'getAndSaveImages');
        jest.spyOn(setFootAction, 'getAndSaveToeData');
        component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);

        expect(setFootAction.getAndSaveImages).toHaveBeenCalled();

        setTimeout(() => {
            expect(setFootAction.getAndSaveToeData).toHaveBeenCalled();
            done()
        }, 200);
    });

    it("images array toedata have data, imageUrls and toeData states should be set", (done) => {

        const store = mockStore({ auth: { isAuth: true }, foot: { selectedFoot: 0, images: images, toeData: toeData } })

        component = shallow(<User store={store} history={mockedHistory} />).dive().dive();

        expect(component.state('imageUrls')).toEqual(images);
        expect(component.state('toeData')).toEqual(toeData);
        done();
    });


});
