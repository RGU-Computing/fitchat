const initialState = {
  startDayHour: 8,
  startDayMinute: 0,
  endDayHour: 22,
  endDayMinute: 0,
  speechSpeed: 0.5,
  speechPitch: 1,
  selectedVoice: 'en-GB-language'
}

function setStartEndDayTime(state = initialState, action) {
  let nextState
  switch (action.type) {
    case 'SET_START_DAY_TIME':
      nextState = {
        ...state,
        startDayHour: action.value.hour,
        startDayMinute: action.value.minute
      }
      return nextState || state
    case 'SET_END_DAY_TIME':
      nextState = {
        ...state,
        endDayHour: action.value.hour,
        endDayMinute: action.value.minute
      }
      return nextState || state
    case 'SET_SPEECH_SPEED':
      nextState = {
        ...state,
        speechSpeed: action.value
      }
      return nextState || state
    case 'SET_SPEECH_PITCH':
      nextState = {
        ...state,
        speechPitch: action.value
      }
      return nextState || state
    case 'SET_SELECTED_VOICE':
      nextState = {
        ...state,
        selectedVoice: action.value
      }
      return nextState || state
    default:
      return state
  }
}

export default setStartEndDayTime
