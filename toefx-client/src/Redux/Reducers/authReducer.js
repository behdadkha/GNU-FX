
const initialState = {
    isAuth : false,
    user : {}
}

export default function(state = initialState , action) {
    switch(action.type){
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