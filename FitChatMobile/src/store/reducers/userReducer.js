const initialState = {
  user: {},
  userDailyStepGoal: 3500
}

function setUser(state = initialState, action) {
  let nextState
  switch (action.type) {
    case 'SET_NEW_USER':
      nextState = {
        ...state,
        user: action.value
      }
      return nextState || state
    case 'SET_USER_DAILY_STEP_GOAL':
      nextState = {
        ...state,
        userDailyStepGoal: action.value
      }
      return nextState || state

    default:
      return state
  }
}

export default setUser
