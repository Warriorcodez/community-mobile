const initialState = { visible: false };

export default function(state=initialState, action) {
  if (action.type === 'TOGGLE_EL_DRAWER') {
    return Object.assign({}, state, { visible: !state.visible });
  }

  return state;
};
