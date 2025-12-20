import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import {
  setToken as setTokenAction,
  clearToken as clearTokenAction,
} from "./authSlice";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { token, user, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const setToken = (token: string, user: any) => {
    dispatch(setTokenAction({ token, user }));
  };

  const clearToken = () => {
    dispatch(clearTokenAction());
  };

  const logout = () => {
    clearToken();
  };

  return {
    token,
    user,
    isAuthenticated,
    setToken,
    clearToken,
    logout,
  };
};
