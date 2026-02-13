import { AuthToken, User } from "tweeter-shared";

export interface AuthView {
    setIsLoading: (isLoading: boolean) => void;
    updateUserInfo: (currentUser: User, displayedUser: User, authToken: AuthToken, remember: boolean) => void;
    navigateTo: (path: string) => void;
    displayErrorMessage: (message: string) => void;
}

export abstract class AuthPresenter {
    private readonly _view: AuthView;

    protected constructor(view: AuthView) {
        this._view = view;
    }

    protected get view() {
        return this._view;
    }

    protected async doAuth(
        authAction: () => Promise<[User, AuthToken]>,
        getDestination: (user: User) => string,
        rememberMe: boolean,
        failureMessage: string
    ) {
        try {
            this.view.setIsLoading(true);
            const [user, authToken] = await authAction();
            this.view.updateUserInfo(user, user, authToken, rememberMe);
            this.view.navigateTo(getDestination(user));
        } catch (error) {
            this.view.displayErrorMessage(`${failureMessage}: ${error}`);
        } finally {
            this.view.setIsLoading(false);
        }
    }
}
