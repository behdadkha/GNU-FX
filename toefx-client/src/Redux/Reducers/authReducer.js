const initialState = {
    isAuth : false,
    user : {}
}

/*
    It saves the user data.
    param state: is a js object with isAuth showing if the user is authenticated or not. And user a js object with user's id and name
    param action: redux specific param.
*/
export default function(state = initialState , action) {
    switch(action.type) {
        case "SET_CURRENT_USER":
            return {
              ...state,
              isAuth : (action.payload.length !== 0),
              user : action.payload
            };

        default:
            return state;
    }
}
