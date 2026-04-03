import { AuthToken, AuthTokenDto, UserDto } from 'tweeter-shared';
import DAOFactory from '../../database/dao/DAOFactory';
import { SessionDAO } from '../../database/dao/SessionDAO';
import UserDAO from '../../database/dao/UserDAO';

export class AuthService {
    private static readonly sessionDurationMs = 24 * 60 * 60 * 1000;
    private sessionDao: SessionDAO;
    private userDao: UserDAO;

    public constructor(factory: DAOFactory) {
        this.sessionDao = factory.getSessionDao();
        this.userDao = factory.getUserDao();
    }

    public async login(alias: string, password: string): Promise<[UserDto, AuthTokenDto]> {
        try {
            const normalizedAlias = alias.startsWith('@') ? alias : `@${alias}`;
            const user = await this.userDao.verifyCredentials(normalizedAlias, password);

            if (user === null) {
                throw new Error('Invalid alias or password');
            }

            const authToken = AuthToken.Generate().dto;
            await this.sessionDao.createSession({
                token: authToken.token,
                alias: normalizedAlias,
                expires_at: authToken.timestamp + AuthService.sessionDurationMs,
            });

            return [user, authToken];
        } catch (error) {
            throw this.wrapServiceError('Login failed', error);
        }
    }

    public async register(
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        imageFileExtension: string
    ): Promise<[UserDto, AuthTokenDto]> {
        try {
            const normalizedAlias = alias.startsWith('@') ? alias : `@${alias}`;
            const imageUrl = this.defaultImageUrl(normalizedAlias, imageFileExtension);
            const userDto: UserDto = {
                firstName,
                lastName,
                alias: normalizedAlias,
                imageUrl,
            };
            const createdUser = await this.userDao.createUser(userDto, password);
            const authToken = AuthToken.Generate().dto;
            await this.sessionDao.createSession({
                token: authToken.token,
                alias: normalizedAlias,
                expires_at: authToken.timestamp + AuthService.sessionDurationMs,
            });

            return [createdUser, authToken];
        } catch (error) {
            throw this.wrapServiceError('Registration failed', error);
        }
    }

    public async logout(token: string): Promise<void> {
        try {
            await this.sessionDao.deleteSession(token);
        } catch (error) {
            throw this.wrapServiceError('Logout failed', error);
        }
    }

    private defaultImageUrl(alias: string, imageFileExtension: string): string {
        const ext = imageFileExtension.startsWith('.') ? imageFileExtension.substring(1) : imageFileExtension;
        const safeAlias = alias.startsWith('@') ? alias.substring(1) : alias;
        return `https://example.com/images/${safeAlias}.${ext || 'png'}`;
    }

    private wrapServiceError(message: string, error: unknown): Error {
        if (error instanceof Error) {
            return new Error(`${message}: ${error.message}`, { cause: error });
        }

        return new Error(message);
    }
}
