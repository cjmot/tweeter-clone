/** @jest-environment node */

import { AuthToken, User } from 'tweeter-shared';
import { anything, instance, mock, verify, when } from '@typestrong/ts-mockito';
import { ServerFacade } from '../../src/network/ServerFacade';
import { PostStatusPresenter, PostStatusView } from '../../src/presenter/PostStatusPresenter';

describe('PostStatusPresenter integration', () => {
    let serverFacade: ServerFacade;

    beforeAll(() => {
        serverFacade = new ServerFacade();
    });

    it('posts a status and appends it to the user story', async () => {
        const uniqueSuffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
        const password = 'password123';
        const alias = `poststatusitest${uniqueSuffix}`;
        const expectedPost = `Integration test status ${uniqueSuffix}`;

        await serverFacade.register(
            'Post',
            'Tester',
            alias,
            password,
            'iVBORw0KGgo=',
            '.png'
        );

        const [loggedInUserDto, loggedInTokenDto] = await serverFacade.login(alias, password);
        const currentUser = User.fromDto(loggedInUserDto);
        const authToken = AuthToken.fromDto(loggedInTokenDto);

        expect(currentUser).not.toBeNull();
        expect(authToken).not.toBeNull();

        const mockView = mock<PostStatusView>();
        when(mockView.displayInfoMessage(anything(), anything())).thenReturn('toast-id');
        const presenter = new PostStatusPresenter(instance(mockView));

        await presenter.submitPost(authToken!, currentUser!, expectedPost);

        verify(mockView.displayInfoMessage('Status posted!', 2000)).once();
        verify(mockView.displayErrorMessage(anything())).never();

        const [storyItems] = await serverFacade.getMoreStoryItems(
            authToken!.token,
            currentUser!.alias,
            10,
            null
        );

        const matchingStatus = storyItems.find((item) => item.post === expectedPost);
        expect(matchingStatus).toBeDefined();
        expect(matchingStatus!.post).toBe(expectedPost);
        expect(matchingStatus!.user.alias).toBe(currentUser!.alias);
        expect(matchingStatus!.user.firstName).toBe(currentUser!.firstName);
        expect(matchingStatus!.user.lastName).toBe(currentUser!.lastName);
        expect(matchingStatus!.user.imageUrl).toBe(currentUser!.imageUrl);
        expect(typeof matchingStatus!.timestamp).toBe('number');
        expect(matchingStatus!.timestamp).toBeGreaterThan(0);
    }, 60000);
});
