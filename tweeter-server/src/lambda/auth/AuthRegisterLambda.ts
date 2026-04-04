import { RegisterRequest, RegisterResponse } from 'tweeter-shared';
import { AuthService } from '../../model/service/AuthService';
import { toApiGatewayError } from '../ApiGatewayError';
import DynamoDAOFactory from '../../database/dynamoDB/DynamoDAOFactory';

export const handler = async (request: RegisterRequest): Promise<RegisterResponse> => {
    try {
        const authService = new AuthService(new DynamoDAOFactory());
        const [user, authToken] = await authService.register(
            request.firstName,
            request.lastName,
            request.alias,
            request.password,
            request.imageBytesBase64,
            request.imageFileExtension
        );

        return {
            success: true,
            message: null,
            user: user,
            authToken: authToken,
        };
    } catch (error) {
        throw toApiGatewayError(error);
    }
};
