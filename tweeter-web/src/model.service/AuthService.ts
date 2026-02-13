import { AuthToken, FakeData, User } from "tweeter-shared";

export class AuthService {
    public async login(alias: string, password: string): Promise<[User, AuthToken]> {
        // TODO: Replace with the result of calling the server
        const user = FakeData.instance.firstUser;

        if (user === null) {
            throw new Error("Invalid alias or password");
        }

        return [user, FakeData.instance.authToken];
    }

    public async register(
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        imageStringBase64: string,
        imageFileExtension: string
    ): Promise<[User, AuthToken]> {
        // TODO: Replace with the result of calling the server
        const user = FakeData.instance.firstUser;

        if (user === null) {
            throw new Error("Invalid registration");
        }

        return [user, FakeData.instance.authToken];
    }
}
