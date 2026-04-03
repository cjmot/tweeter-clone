import { FakeData, UserDto } from 'tweeter-shared';

export class UserService {
    public async getUser(token: string, alias: string): Promise<UserDto | null> {
        // TODO: Replace with the result of calling DB
        const user = FakeData.instance.findUserByAlias(alias);
        return user == null ? null : user.dto;
    }
}
