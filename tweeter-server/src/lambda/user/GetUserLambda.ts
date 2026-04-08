import { GetUserResponse, UserRequest } from 'tweeter-shared';
import { UserService } from '../../model/service/UserService';
import { toApiGatewayError } from '../ApiGatewayError';

export const handler = async (request: UserRequest): Promise<GetUserResponse> => {
    try {
        const userService = new UserService();
        const user = await userService.getUser(request.token, request.userAlias);

        return {
            success: true,
            message: null,
            user: user,
        };
    } catch (error) {
        throw toApiGatewayError(error);
    }
};
