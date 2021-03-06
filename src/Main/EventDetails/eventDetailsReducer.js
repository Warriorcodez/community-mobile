const initialState = {
  currentEventIndex: 0,
  participants: [],
  isAttendingEvent: false,
  hasLikedEvent: false
};

export default function(state = initialState, action) {
  if (action.type === 'SET_CURRENT_EVENT') {
    return Object.assign({}, state, { currentEventIndex: action.payload });
  }
  if (action.type === 'SET_CURRENT_EVENT_PARTICIPANTS') {
    return Object.assign({}, state, { participants: action.payload });
  }

  if (action.type === 'UPDATE_BUTTON') {
    return Object.assign({}, state, action.payload);
  }

  return state;
}
