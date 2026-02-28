import { AppNavbarView, AppNavbarPresenter } from '../../src/presenter/AppNavbarPresenter';
import { anything, capture, instance, mock, spy, verify, when } from '@typestrong/ts-mockito';
import { AuthToken } from 'tweeter-shared';
import { AuthService } from '../../src/model.service/AuthService';

describe('AppNavbarPresenter', () => {
    let mockAppNavbarPresenterView: AppNavbarView;
    let appNavbarPresenter: AppNavbarPresenter;
    let mockService: AuthService;

    const authToken = new AuthToken('abc123', Date.now());

    beforeEach(() => {
        mockAppNavbarPresenterView = mock<AppNavbarView>();
        const mockAppNavbarPresenterViewInstance = instance(mockAppNavbarPresenterView);
        when(mockAppNavbarPresenterView.displayInfoMessage(anything(), 0)).thenReturn('messageId123');
        const appNavbarPresenterSpy = spy(new AppNavbarPresenter(mockAppNavbarPresenterViewInstance));
        appNavbarPresenter = instance(appNavbarPresenterSpy);

        mockService = mock<AuthService>();

        when(appNavbarPresenterSpy.service).thenReturn(instance(mockService));
    });

    it('tells the view to display a logging out message', async () => {
        await appNavbarPresenter.logOut(authToken);
        verify(mockAppNavbarPresenterView.displayInfoMessage('Logging Out...', 0)).once();
    });

    it('calls logout on the user service with the correct auth token', async () => {
        await appNavbarPresenter.logOut(authToken);

        let [capturedAuthToken] = capture(mockService.logout).last();
        expect(capturedAuthToken).toEqual(authToken);
    });

    it('tells the view to clear the info message that was displayed previously, clears the user info, and navigates to the login page when successful', async () => {
        await appNavbarPresenter.logOut(authToken);

        verify(mockAppNavbarPresenterView.deleteMessage('messageId123')).once();
        verify(mockAppNavbarPresenterView.clearUserInfo()).once();
        verify(mockAppNavbarPresenterView.navigateTo('/login')).once();

        verify(mockAppNavbarPresenterView.displayErrorMessage(anything())).never();
    });

    it('tells the view to display an error message and does not tell it to clear the info message, clear the user info or navigate to the login page when unsuccessful', async () => {
        let error = new Error('Test error');
        when(mockService.logout(anything())).thenThrow(error);

        await appNavbarPresenter.logOut(authToken);
        verify(
            mockAppNavbarPresenterView.displayErrorMessage('Failed to log out user because of exception: Test error')
        ).once();

        verify(mockAppNavbarPresenterView.clearUserInfo()).never();
        verify(mockAppNavbarPresenterView.navigateTo('/login')).never();
        verify(mockAppNavbarPresenterView.deleteMessage(anything())).once();
    });
});
