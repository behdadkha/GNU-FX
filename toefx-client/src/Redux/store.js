import { createStore } from "redux";
import reducer from './Reducers/index';

const initialState = {}

const store = createStore(reducer);

export default store;