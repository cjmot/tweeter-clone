import { useContext } from "react";
import { UserInfoActions, UserInfoActionsContext, UserInfoContext } from "./UserInfoContexts";

export const useUserInfoActions = (): UserInfoActions => {
    return useContext(UserInfoActionsContext);
};

export const useUserInfo = () => {
    return useContext(UserInfoContext);
};
