const initialState = {
  logged: false,
  user: null,
}

export default (state = initialState, { type, payload }) => {
  switch (type) {

    case "AUTH_LOGIN":
      return { ...state, ...payload }

    default:
      return state
  }
}
