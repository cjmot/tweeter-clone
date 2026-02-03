import { useNavigate } from "react-router-dom";
import { AuthToken, FakeData, User } from "tweeter-shared";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserHooks";
import { useMessageActions } from "../toaster/MessageHooks";
import { MouseEvent } from "react";

interface UserNavigation {
    navigateToUser: (event: MouseEvent, featureURL: string) => Promise<void>;
}

const extractAlias = (value: string): string => {
    const index = value.indexOf("@");
    return value.substring(index);
};

const getUser = async (authToken: AuthToken, alias: string): Promise<User | null> => {
    // TODO: Replace with the result of calling server
    return FakeData.instance.findUserByAlias(alias);
};

export const useUserNavigation = (): UserNavigation => {
    const { authToken, displayedUser } = useUserInfo();
    const { setDisplayedUser } = useUserInfoActions();
    const { displayErrorMessage } = useMessageActions();
    const navigate = useNavigate();

    const navigateToUser = async (event: MouseEvent, featureURL: string): Promise<void> => {
        event.preventDefault();

        try {
            const alias = extractAlias(event.target.toString());

            const toUser = await getUser(authToken!, alias);

            if (toUser) {
                if (!toUser.equals(displayedUser!)) {
                    setDisplayedUser(toUser);
                    navigate(`${featureURL}/${toUser.alias}`);
                }
            }
        } catch (error) {
            displayErrorMessage(`Failed to get user because of exception: ${error}`);
        }
    };

    return { navigateToUser };
};
