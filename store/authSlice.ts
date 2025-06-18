import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from ".";
import { IUser } from "@/types";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

interface AuthState {
  user?: IUser;
  partner?: IUser;
  isAuthenticated?: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: undefined,
  partner: undefined,
  isAuthenticated: false,
  loading: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
    setPartner: (state, action: PayloadAction<IUser>) => {
      state.partner = action.payload;
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logOutUser: (state) => {
      state.user = undefined;
      state.partner = undefined;
      state.isAuthenticated = false;
      state.loading = false;
      signOut(auth)
        .then(() => {
          console.log("User signed out successfully");
        })
        .catch((error) => {
          console.error("Error signing out user:", error);
        });
    },
  },
});

export const { setUser, setPartner, setIsAuthenticated, setLoading, logOutUser } = authSlice.actions;
export const selectUser = (state: RootState) => state.auth.user;
export const selectPartner = (state: RootState) => state.auth.partner;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectLoading = (state: RootState) => state.auth.loading;

export default authSlice.reducer;
