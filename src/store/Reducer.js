const Reducer = (state, action) => {
  switch(action.type) {
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload
      }

    case 'SET_USERNAME':
      return {
        ...state,
        username: action.payload
      }

    case 'SET_ROLES':
      return {
        ...state,
        roles: action.payload
      }

    case 'ADD_ROLE':
      return {
        ...state,
        roles: state.roles.concat(action.payload)
      }

    case 'REMOVE_ROLE':
      return {
        ...state,
        roles: state.roles.filter(role => role.id !== action.payload)
      }

    case 'TOGGLE_LOGIN_STATUS':
      return { ...state, loginStatus: !state.loginStatus }

    case 'SET_LOGIN_STATUS':
      return { ...state, loginStatus: action.payload }

    case 'TOGGLE_SHOW_LOGIN_FAILED':
      return { ...state, showLoginFailed: !state.showLoginFailed }

    case 'SET_SHOW_LOGIN_FAILED':
      return { ...state, showLoginFailed: action.payload }

    default: return state
  }
}

export default Reducer