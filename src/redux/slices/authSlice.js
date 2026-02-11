import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  authData: JSON.parse(localStorage.getItem('authData')) || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.authData = action.payload.authData; // 로그인 성공시 상태값 업데이트
      localStorage.setItem('authData', JSON.stringify(action.payload.authData));
    },
    logout: (state) => {
      state.authData = null; // 로그아웃 성공시 null로 상태값 업데이트
      localStorage.removeItem('authData');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
