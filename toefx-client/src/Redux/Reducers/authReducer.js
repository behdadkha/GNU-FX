const initialState = {
    isAuth : false,
    user : {}
}

/*
    Saves the user's data to the database.
    param state: An object with:
        isAuth: showing if the user is authenticated or not. 
        user: An object with user's id and name.
    param action: Redux specific param.
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
