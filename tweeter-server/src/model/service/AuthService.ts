import { AuthToken, AuthTokenDto, UserDto } from 'tweeter-shared';
import DAOFactory from '../../database/dao/DAOFactory';
import ImagesDAO from '../../database/dao/ImagesDAO';
import { SessionDAO } from '../../database/dao/SessionDAO';
import UserDAO from '../../database/dao/UserDAO';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';

export class AuthService {
    private static readonly sessionDurationMs = 2 * 60 * 1000;
    private static readonly apiPrefixes = ['bad-request:', 'unauthorized:', 'internal-server-error:'];
    private imagesDao: ImagesDAO;
    private sessionDao: SessionDAO;
    private userDao: UserDAO;

    public constructor(factory: DAOFactory = new DynamoDAOFactory()) {
        this.imagesDao = factory.getImagesDao();
        this.sessionDao = factory.getSessionDao();
        this.userDao = factory.getUserDao();
    }

    public async login(alias: string, password: string): Promise<[UserDto, AuthTokenDto]> {
        try {
            const normalizedAlias = alias.startsWith('@') ? alias : `@${alias}`;
            const user = await this.userDao.verifyCredentials(normalizedAlias, password);

            if (user === null) {
                throw new Error('unauthorized: invalid-credentials');
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
        imageBytesBase64: string,
        imageFileExtension: string
    ): Promise<[UserDto, AuthTokenDto]> {
        try {
            const normalizedAlias = alias.startsWith('@') ? alias : `@${alias}`;
            const imageBytes = Uint8Array.from(Buffer.from(imageBytesBase64, 'base64'));
            const imageUrl = await this.imagesDao.uploadProfileImage(
                normalizedAlias,
                imageBytes,
                imageFileExtension
            );
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

    private wrapServiceError(message: string, error: unknown): Error {
        if (error instanceof Error) {
            if (AuthService.apiPrefixes.some((prefix) => error.message.startsWith(prefix))) {
                return error;
            }

            return new Error(`${message}: ${error.message}`, { cause: error });
        }

        return new Error(message);
    }
}
