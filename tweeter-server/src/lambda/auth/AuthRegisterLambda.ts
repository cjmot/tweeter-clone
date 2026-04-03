import { RegisterRequest, RegisterResponse } from 'tweeter-shared';
import { AuthService } from '../../model/service/AuthService';
import { toApiGatewayError } from '../ApiGatewayError';

export const handler = async (request: RegisterRequest): Promise<RegisterResponse> => {
    try {
        const authService = new AuthService();
        const [user, authToken] = await authService.register(
            request.firstName,
            request.lastName,
            request.alias,
            request.password,
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
