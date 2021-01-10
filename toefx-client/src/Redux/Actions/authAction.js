import { SetAuthHeader } from "../../Utils";

export const SetCurrentUser = (data) => {
    return {
        type : "SET_CURRENT_USER",
        payload: data
    }
}

export const logOutUser = () => Dispatch => {
    //Eemove the token from the web browser
    localStorage.removeItem('jwt');

    //Eemove auth header from the feature requests
    SetAuthHeader(false);

    //Eemove the current user's data
    Dispatch(SetCurrentUser({}));
}
