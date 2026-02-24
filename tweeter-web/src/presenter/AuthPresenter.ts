import { AuthToken, User } from 'tweeter-shared';
import { Presenter, View } from './Presenter';

export interface AuthView extends View {
    setIsLoading: (isLoading: boolean) => void;
    updateUserInfo: (currentUser: User, displayedUser: User, authToken: AuthToken, remember: boolean) => void;
    navigateTo: (path: string) => void;
}

export abstract class AuthPresenter extends Presenter<AuthView> {
    protected constructor(view: AuthView) {
        super(view);
    }

    protected async doAuth(
        authAction: () => Promise<[User, AuthToken]>,
        getDestination: (user: User) => string,
        rememberMe: boolean,
        operationDescription: string
    ) {
        this.doFailureReportingOperation(async () => {
            this.view.setIsLoading(true);
            const [user, authToken] = await authAction();
            this.view.updateUserInfo(user, user, authToken, rememberMe);
            this.view.navigateTo(getDestination(user));
        }, operationDescription).finally(() => this.view.setIsLoading(false));
    }
}
