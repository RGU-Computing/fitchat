const initialState = {
  isFirstLaunch: true
}

function setIsFirstLaunch(state = initialState, action) {
  let nextState
  switch (action.type) {
    case 'SET_IS_FIRST_LAUNCH':
      nextState = {
        ...state,
        isFirstLaunch: action.value
      }
      return nextState || state
    default:
      return state
  }
}

export default setIsFirstLaunch
