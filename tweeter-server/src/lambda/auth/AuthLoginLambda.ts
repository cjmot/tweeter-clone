import { LoginRequest, LoginResponse } from 'tweeter-shared';
import { AuthService } from '../../model/service/AuthService';

export const handler = async (request: LoginRequest): Promise<LoginResponse> => {
    const authService = new AuthService();
    const [user, authToken] = await authService.login(request.alias, request.password);

    return {
        success: true,
        message: null,
        user: user,
        authToken: authToken,
    };
};
