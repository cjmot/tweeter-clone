import { LogoutRequest, LogoutResponse } from 'tweeter-shared';
import { AuthService } from '../../model/service/AuthService';
import { toApiGatewayError } from '../ApiGatewayError';

export const handler = async (request: LogoutRequest): Promise<LogoutResponse> => {
    try {
        const authService = new AuthService();
        await authService.logout(request.token);

        return {
            success: true,
            message: null,
        };
    } catch (error) {
        throw toApiGatewayError(error);
    }
};
