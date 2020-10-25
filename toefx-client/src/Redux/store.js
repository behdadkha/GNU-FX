import {createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk'
import reducer from './Reducers/index';

const initialState = {}

const store = createStore(reducer, applyMiddleware(...[thunk]));

export default store;