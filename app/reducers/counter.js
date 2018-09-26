// @flow
import moment from 'moment';
import { INCREMENT_COUNTER, DECREMENT_COUNTER } from '../actions/counter';
import type { Action } from './types';

const initialState = 0;

export default function counter(state = initialState, action: Action) {
  switch (action.type) {
    case 'STORE_TIME':
      return {
        ...state,
        trakerHistory: action.value
      };
    case 'INCREMENT_TIMER':
      return {
        ...state,
        timer: action.value
      };
    default:
      return state;
  }
}
