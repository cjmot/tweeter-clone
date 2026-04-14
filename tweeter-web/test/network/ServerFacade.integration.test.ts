/** @jest-environment node */

import 'dotenv/config';
import { AuthTokenDto, UserDto } from 'tweeter-shared';
import { ServerFacade } from '../../src/network/ServerFacade';

describe('ServerFacade integration (happy paths)', () => {
    let serverFacade: ServerFacade;
    let registeredUser: UserDto;
    let authToken: AuthTokenDto;

    beforeAll(async () => {
        serverFacade = new ServerFacade();

        const uniqueSuffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
        const testAlias = `testAlias${uniqueSuffix}`;
        const [user, token] = await serverFacade.register(
            'Integration',
            'Tester',
            testAlias,
            'password123',
            'iVBORw0KGgo=',
            '.png'
        );

        registeredUser = user;
        authToken = token;
    }, 30000);

    it('register returns a user and auth token', () => {
        expect(registeredUser.alias.startsWith('@')).toBe(true);
        expect(registeredUser.alias.length).toBeGreaterThan(1);
        expect(registeredUser.firstName.length).toBeGreaterThan(0);
        expect(registeredUser.lastName.length).toBeGreaterThan(0);
        expect(registeredUser.imageUrl.length).toBeGreaterThan(0);

        expect(authToken.token.length).toBeGreaterThan(0);
        expect(authToken.timestamp).toBeGreaterThan(0);
    });

    it('getFollowers returns a valid paged response', async () => {
        const [followers, hasMore] = await serverFacade.getMoreFollowers(
            authToken.token,
            registeredUser.alias,
            10,
            null
        );

        expect(Array.isArray(followers)).toBe(true);
        expect(followers.length).toBeLessThanOrEqual(10);
        expect(typeof hasMore).toBe('boolean');

        for (const follower of followers) {
            expect(follower.alias.startsWith('@')).toBe(true);
            expect(follower.firstName.length).toBeGreaterThan(0);
            expect(follower.lastName.length).toBeGreaterThan(0);
            expect(follower.imageUrl.length).toBeGreaterThan(0);
        }
    }, 30000);

    it('getFollowingCount returns a non-negative number', async () => {
        const count = await serverFacade.getFolloweeCount(authToken.token, registeredUser.alias);

        expect(Number.isInteger(count)).toBe(true);
        expect(count).toBeGreaterThanOrEqual(0);
    }, 30000);
});
