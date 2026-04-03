import { AuthToken, AuthTokenDto, FakeData, UserDto } from 'tweeter-shared';
import DAOFactory from '../../database/dao/DAOFactory';
import { SessionDAO } from '../../database/dao/SessionDAO';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';

export class AuthService {
    private static readonly sessionDurationMs = 24 * 60 * 60 * 1000;
    private sessionDao: SessionDAO;

    public constructor(factory: DAOFactory = new DynamoDAOFactory()) {
        this.sessionDao = factory.getSessionDao();
    }

    public async login(alias: string, password: string): Promise<[UserDto, AuthTokenDto]> {
        try {
            const user = FakeData.instance.findUserByAlias(alias);

            if (user === null) {
                throw new Error('Invalid alias or password');
            }

            const authToken = AuthToken.Generate().dto;
            await this.sessionDao.createSession({
                token: authToken.token,
                alias: user.alias,
                expires_at: authToken.timestamp + AuthService.sessionDurationMs,
            });

            return [user.dto, authToken];
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
            const userDto: UserDto = {
                firstName,
                lastName,
                alias: normalizedAlias,
                imageUrl: imageFileExtension,
            };
            const authToken = AuthToken.Generate().dto;
            await this.sessionDao.createSession({
                token: authToken.token,
                alias: normalizedAlias,
                expires_at: authToken.timestamp + AuthService.sessionDurationMs,
            });

            return [userDto, authToken];
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

    private wrapServiceError(message: string, error: unknown): Error {
        if (error instanceof Error) {
            return new Error(`${message}: ${error.message}`, { cause: error });
        }

        return new Error(message);
    }
}
