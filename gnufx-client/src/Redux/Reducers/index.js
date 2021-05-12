import { combineReducers } from 'redux';
import authReducer from './authReducer';
import setFootReducer from './setFootReducer';

/*
    Exports the reducers used by various components.
*/
export default combineReducers({
    auth : authReducer,
    foot: setFootReducer
});
