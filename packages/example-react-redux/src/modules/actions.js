// types of action
export const Types = {
  SET_USER: "SET_USER",
};

export const setUser = (user) => ({
  types: Types.SET_USER,
  payload: user
})