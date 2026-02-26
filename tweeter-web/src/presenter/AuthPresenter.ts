import { AuthToken, User } from 'tweeter-shared';
import { Presenter, View } from './Presenter';
import { AuthService } from '../model.service/AuthService';

export interface AuthView extends View {
    setIsLoading: (isLoading: boolean) => void;
    updateUserInfo: (currentUser: User, displayedUser: User, authToken: AuthToken, remember: boolean) => void;
    navigateTo: (path: string) => void;
}

export abstract class AuthPresenter<T extends AuthView> extends Presenter<T> {
    protected authService = new AuthService();

    protected async doAuth(
        authAction: () => Promise<[User, AuthToken]>,
        getDestination: (user: User) => string,
        rememberMe: boolean,
        operationDescription: string
    ) {
        await this.doLoadingOperation(
            this.view,
            async () => {
                const [user, authToken] = await authAction();
                this.view.updateUserInfo(user, user, authToken, rememberMe);
                this.view.navigateTo(getDestination(user));
            },
            operationDescription,
            'Signing in...'
        );
    }
}
