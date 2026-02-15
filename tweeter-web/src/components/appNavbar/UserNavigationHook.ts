import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserHooks";
import { useMessageActions } from "../toaster/MessageHooks";
import { MouseEvent } from "react";
import { UserNavigationPresenter, UserNavigationView } from "../../presenter/UserNavigationPresenter";

interface UserNavigation {
    navigateToUser: (event: MouseEvent, featureURL: string) => Promise<void>;
}

export const useUserNavigation = (): UserNavigation => {
    const { authToken, displayedUser } = useUserInfo();
    const { setDisplayedUser } = useUserInfoActions();
    const { displayErrorMessage } = useMessageActions();
    const navigate = useNavigate();

    const view: UserNavigationView = {
        setDisplayedUser: setDisplayedUser,
        navigateTo: navigate,
        displayErrorMessage: displayErrorMessage,
    };

    const presenterRef = useRef<UserNavigationPresenter | null>(null);
    if (!presenterRef.current) {
        presenterRef.current = new UserNavigationPresenter(view);
    }

    const navigateToUser = async (event: MouseEvent, featureURL: string): Promise<void> => {
        event.preventDefault();
        await presenterRef.current!.navigateToUser(authToken!, displayedUser!, event.target!.toString(), featureURL);
    };

    return { navigateToUser };
};
