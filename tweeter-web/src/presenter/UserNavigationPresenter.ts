import { AuthToken, User } from 'tweeter-shared';
import { UserService } from '../model.service/UserService';

export interface UserNavigationView {
    setDisplayedUser: (user: User) => void;
    navigateTo: (path: string) => void;
    displayErrorMessage: (message: string) => void;
}

export class UserNavigationPresenter {
    private readonly _view: UserNavigationView;
    private readonly service: UserService;

    public constructor(view: UserNavigationView) {
        this._view = view;
        this.service = new UserService();
    }

    private get view() {
        return this._view;
    }

    public navigateToUser = async (
        authToken: AuthToken,
        displayedUser: User,
        clickedValue: string,
        featureURL: string
    ): Promise<void> => {
        try {
            const alias = this.extractAlias(clickedValue);
            const toUser = await this.service.getUser(authToken, alias);

            if (toUser && !toUser.equals(displayedUser)) {
                this.view.setDisplayedUser(toUser);
                this.view.navigateTo(`${featureURL}/${toUser.alias}`);
            }
        } catch (error) {
            this.view.displayErrorMessage(`Failed to get user because of exception: ${error}`);
        }
    };

    private extractAlias = (value: string): string => {
        const index = value.indexOf('@');
        return value.substring(index);
    };
}
