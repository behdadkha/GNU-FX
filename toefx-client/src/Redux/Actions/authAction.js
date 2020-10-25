import setAuthHeader from "../../utils/setAuthHeader";

export const setCurrentUser = (data) => {
    return {
        type : "SET_CURRENT_USER",
        payload: data
    }
}

export const logOutUser = () => dispatch => {
    //remove the token from the web browser
    localStorage.removeItem('jwt');

    //remove auth header from the feature requests
    setAuthHeader(false);

    //remove the current user's data
    dispatch(setCurrentUser({}));

}