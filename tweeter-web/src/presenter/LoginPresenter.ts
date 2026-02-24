import { AuthService } from '../model.service/AuthService';
import { AuthPresenter, AuthView } from './AuthPresenter';

export class LoginPresenter extends AuthPresenter {
    private readonly service: AuthService;

    public constructor(view: AuthView) {
        super(view);
        this.service = new AuthService();
    }

    public doLogin = async (alias: string, password: string, rememberMe: boolean, originalUrl?: string) => {
        await this.doAuth(
            () => this.service.login(alias, password),
            (user) => (originalUrl ? originalUrl : `/feed/${user.alias}`),
            rememberMe,
            'log in user'
        );
    };
}
