export default function(state = {selectedFoot : 0} , action) {
    switch(action.type){
        case "SET_SELECTED_FOOT":
            return {
              ...state,
              selectedFoot : action.payload
            };

        default:
            return state;
    }
}