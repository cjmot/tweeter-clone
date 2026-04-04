import { AuthToken, User } from 'tweeter-shared';
import { Service } from './Service';

export class AuthService extends Service {
    constructor() {
        super();
    }

    public async login(alias: string, password: string): Promise<[User, AuthToken]> {
        const [userDto, authTokenDto] = await this.serverFacade.login(alias, password);
        const user = User.fromDto(userDto);
        const authToken = AuthToken.fromDto(authTokenDto);

        if (user == null || authToken == null) {
            throw new Error('Invalid alias or password');
        }

        return [user, authToken];
    }

    public async register(
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        imageFileExtension: string
    ): Promise<[User, AuthToken]> {
        const [userDto, authTokenDto] = await this.serverFacade.register(
            firstName,
            lastName,
            alias,
            password,
            imageFileExtension
        );
        const user = User.fromDto(userDto);
        const authToken = AuthToken.fromDto(authTokenDto);

        if (user == null || authToken == null) {
            throw new Error('Invalid registration');
        }

        return [user, authToken];
    }

    public async logout(authToken: AuthToken): Promise<void> {
        await this.serverFacade.logout(authToken.token);
    }
}
