import { AuthTokenDto, FakeData, UserDto } from 'tweeter-shared';

export class AuthService {
    public async login(alias: string, password: string): Promise<[UserDto, AuthTokenDto]> {
        // TODO: Replace with the result of calling the Database
        const user = FakeData.instance.firstUser;

        if (user === null) {
            throw new Error('Invalid alias or password');
        }

        return [user.dto, FakeData.instance.authToken.dto];
    }

    public async register(
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        imageFileExtension: string
    ): Promise<[UserDto, AuthTokenDto]> {
        // TODO: Replace with the result of calling the Database
        const user = FakeData.instance.firstUser;

        if (user === null) {
            throw new Error('Invalid registration');
        }

        return [user.dto, FakeData.instance.authToken.dto];
    }

    public async logout(token: string): Promise<void> {
        // Pause so we can see the logging out message. Delete when the call to the DB is implemented.
        await new Promise((res) => setTimeout(res, 1000));
    }
}
