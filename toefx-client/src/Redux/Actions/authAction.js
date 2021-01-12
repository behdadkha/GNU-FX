import {SetAuthHeader} from "../../Utils";

/*
    Sets the client-side data for the user once they log in.
    param data: the user's id and name.
*/
export const SetCurrentUser = (data) => {
    return {
        type : "SET_CURRENT_USER",
        payload: data
    }
}

/*
    Logs out the current user from the website.
    Removes the auth header and deletes the user's data.
*/
export const LogOutUser = () => Dispatch => {
    //Remove the token from the web browser
    localStorage.removeItem('jwt');

    //Remove auth header from the feature requests
    SetAuthHeader(false);

    //Remove the current user's data
    Dispatch(SetCurrentUser({}));
}
