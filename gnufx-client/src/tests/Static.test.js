import { mount, shallow } from 'enzyme';
import React from 'react';
import FirstPage from '../components/FirstPage';
import Component404 from '../components/Component404';

import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('First Page renders', () => {
    it('', () => {
        const store = mockStore({ auth: { isAuth: false } });
        mount(<Provider store={store}><FirstPage /></Provider>);
    })
});

describe('Component404 renders', () => {
    it('', () => {
        shallow(<Component404 />)
    })
});
