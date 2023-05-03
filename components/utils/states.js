const STATES = {
  IDLE: 'IDLE',
  MOVIESLIKE: 'MOVIESLIKE',
  MORE: 'MORE',
};

// Initialiaze with default state
let currentState = STATES.IDLE;

function updateState(newState) {
  currentState = newState;
};

function getCurrentState() {
  return currentState;
};

// Export states and functions for use in other files
module.exports = {
  STATES,
  updateState,
  getCurrentState,
};