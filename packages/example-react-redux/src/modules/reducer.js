import { Types } from "./actions";
import _ from "lodash";

const defaultState = {
  user: null,
};

export const userReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.SET_USER: {
      console.log(action);

      const user = action.payload
      return {
        ...state,
        user,
      }
    }

    default:
      return state;
  }
};