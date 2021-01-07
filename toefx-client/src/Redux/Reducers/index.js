import { combineReducers } from 'redux';
import authReducer from './authReducer';
import setFootReducer from './setFootReducer';


export default combineReducers({
    auth : authReducer,
    setFoot: setFootReducer
});