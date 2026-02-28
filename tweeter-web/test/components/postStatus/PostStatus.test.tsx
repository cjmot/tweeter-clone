import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import '@testing-library/jest-dom';
import PostStatus from '../../../src/components/postStatus/PostStatus';
import { PostStatusPresenter } from '../../../src/presenter/PostStatusPresenter';
import { instance, mock, verify } from '@typestrong/ts-mockito';
import { AuthToken, User } from 'tweeter-shared';
import { useUserInfo } from '../../../src/components/userInfo/UserHooks';
import { useMessageActions } from '../../../src/components/toaster/MessageHooks';

library.add(fab);

jest.mock('../../../src/components/userInfo/UserHooks', () => ({
    ...jest.requireActual('../../../src/components/userInfo/UserHooks'),
    __esModule: true,
    useUserInfo: jest.fn(),
}));

jest.mock('../../../src/components/toaster/MessageHooks', () => ({
    ...jest.requireActual('../../../src/components/toaster/MessageHooks'),
    __esModule: true,
    useMessageActions: jest.fn(),
}));

describe('PostStatus', () => {
    const testUser = new User('John', 'Doe', '@johndoe', 'testImage.png');
    const testAuthToken = new AuthToken('abc123', Date.now());

    beforeEach(() => {
        (useUserInfo as jest.Mock).mockReturnValue({
            currentUser: testUser,
            authToken: testAuthToken,
        });

        (useMessageActions as jest.Mock).mockReturnValue({
            displayInfoMessage: jest.fn(),
            displayErrorMessage: jest.fn(),
            deleteMessage: jest.fn(),
        });
    });

    it('post status and clear buttons disabled on start', () => {
        const { postStatusButton, clearButton } = renderPostStatusAndGetElements();
        expect(postStatusButton).toBeDisabled();
        expect(clearButton).toBeDisabled();
    });

    it('post status and clear buttons enabled when text field has text', async () => {
        const { postStatusButton, clearButton, textArea, user } = renderPostStatusAndGetElements();
        await user.type(textArea, 'test post');
        expect(postStatusButton).toBeEnabled();
        expect(clearButton).toBeEnabled();
    });

    it('post status and clear buttons disabled when text field is cleared', async () => {
        const { postStatusButton, clearButton, textArea, user } = renderPostStatusAndGetElements();
        await user.type(textArea, 'test post');
        expect(postStatusButton).toBeEnabled();
        expect(clearButton).toBeEnabled();
        await user.clear(textArea);
        expect(postStatusButton).toBeDisabled();
        expect(clearButton).toBeDisabled();
    });

    it("presenter's submitPost method called with correct parameters when post status button is pressed", async () => {
        const mockPresenter = mock<PostStatusPresenter>();
        const mockPresenterInstance = instance(mockPresenter);

        const testPost = 'This is a test post';

        const { postStatusButton, textArea, user } = renderPostStatusAndGetElements(mockPresenterInstance);

        await user.type(textArea, testPost);
        await user.click(postStatusButton);

        verify(mockPresenter.submitPost(testAuthToken, testUser, testPost)).once();
    });
});

function renderPostStatus(presenter?: PostStatusPresenter) {
    return render(<PostStatus presenter={presenter} />);
}

function renderPostStatusAndGetElements(presenter?: PostStatusPresenter) {
    const user = userEvent.setup();

    renderPostStatus(presenter);

    const postStatusButton = screen.getByRole('button', { name: /Post Status/i });
    const clearButton = screen.getByRole('button', { name: /Clear/i });
    const textArea = screen.getByPlaceholderText("What's on your mind?");

    return { user, postStatusButton, clearButton, textArea };
}
