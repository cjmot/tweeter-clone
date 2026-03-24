import { LogoutRequest, LogoutResponse } from 'tweeter-shared';
import { AuthService } from '../../model/service/AuthService';

export const handler = async (request: LogoutRequest): Promise<LogoutResponse> => {
    const authService = new AuthService();
    await authService.logout(request.token);

    return {
        success: true,
        message: null,
    };
};
