import { PostStatusView, PostStatusPresenter } from '../../src/presenter/PostStatusPresenter';
import { anything, capture, instance, mock, spy, verify, when } from '@typestrong/ts-mockito';
import { AuthToken, User, Status } from 'tweeter-shared';
import { StatusService } from '../../src/model.service/StatusService';

describe('PostStatusPresenter', () => {
    let mockPostStatusView: PostStatusView;
    let postStatusPresenter: PostStatusPresenter;
    let mockService: StatusService;

    const authToken = new AuthToken('abc123', Date.now());
    const currentUser = new User('firstName', 'lastName', 'testAlias', './image.jpeg');
    const post = 'Test post';

    beforeEach(() => {
        mockPostStatusView = mock<PostStatusView>();
        const mockPostStatusViewInstance = instance(mockPostStatusView);
        when(mockPostStatusView.displayInfoMessage(anything(), anything())).thenReturn('messageId123');

        const postStatusPresenterSpy = spy(new PostStatusPresenter(mockPostStatusViewInstance));
        postStatusPresenter = instance(postStatusPresenterSpy);

        mockService = mock<StatusService>();

        when(postStatusPresenterSpy.service).thenReturn(instance(mockService));
    });

    it('tells the view to display a posting status message', async () => {
        await postStatusPresenter.submitPost(authToken, currentUser, post);
        verify(mockPostStatusView.displayInfoMessage('Posting status...', 0)).once();
    });

    it('calls postStatus on the post status service with the correct status string and auth token', async () => {
        await postStatusPresenter.submitPost(authToken, currentUser, post);

        let [capturedAuthToken, capturedStatus] = capture(mockService.postStatus).last();
        expect(capturedAuthToken).toEqual(authToken);
        expect(capturedStatus.post).toEqual(post);
        expect(capturedStatus.user).toEqual(currentUser);
    });

    it('tells the view to clear the info message that was displayed previously, clear the post, and display a status posted message when successful', async () => {
        await postStatusPresenter.submitPost(authToken, currentUser, post);

        verify(mockPostStatusView.deleteMessage('messageId123')).once();
        verify(mockPostStatusView.clearPost()).once();
        verify(mockPostStatusView.displayInfoMessage('Status posted!', 2000)).once();

        verify(mockPostStatusView.displayErrorMessage(anything())).never();
    });

    it('tells the view to clear the info message and display an error message but does not tell it to clear the post or display a status posted message when post status unsuccessful', async () => {
        let error = new Error('Test error');
        when(mockService.postStatus(anything(), anything())).thenThrow(error);

        await postStatusPresenter.submitPost(authToken, currentUser, post);
        verify(mockPostStatusView.displayErrorMessage('Failed to post status because of exception: Test error')).once();

        verify(mockPostStatusView.clearPost()).never();
        verify(mockPostStatusView.displayInfoMessage('Status posted!', 2000)).never();
        verify(mockPostStatusView.deleteMessage(anything())).once();
    });
});
