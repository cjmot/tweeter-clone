import { LoginRequest, LoginResponse } from 'tweeter-shared';
import { AuthService } from '../../model/service/AuthService';
import { toApiGatewayError } from '../ApiGatewayError';

export const handler = async (request: LoginRequest): Promise<LoginResponse> => {
    try {
        const authService = new AuthService();
        const [user, authToken] = await authService.login(request.alias, request.password);

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
