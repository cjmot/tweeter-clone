import { AuthPresenter, AuthView } from './AuthPresenter';

export class LoginPresenter extends AuthPresenter<AuthView> {
    public doLogin = async (alias: string, password: string, rememberMe: boolean, originalUrl?: string) => {
        await this.doAuth(
            () => this.authService.login(alias, password),
            (user) => (originalUrl ? originalUrl : `/feed/${user.alias}`),
            rememberMe,
            'log in user'
        );
    };
}
