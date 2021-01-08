const initialState = {
    selectedFoot: 0,
    images: []
}

export default function(state = initialState , action) {
    switch(action.type){
        case "SET_SELECTED_FOOT":
            return {
              ...state,
              selectedFoot: action.payload
            };
        case "SAVE_IMAGES":
            return {
                ...state,
                images: action.payload
            };

        default:
            return state;
    }
}