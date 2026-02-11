import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import modalReducer from './slices/modalSlice';
import apiReducer from './slices/apiSlice';

const store = configureStore({
  reducer: combineReducers({
    auth: authReducer,
    modal: modalReducer,
    api: apiReducer,
  }),
});

export default store;
