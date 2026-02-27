import { MemoryRouter } from 'react-router-dom';
import Login from '../../../../src/components/authentication/login/Login';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import '@testing-library/jest-dom';
import { LoginPresenter } from '../../../../src/presenter/LoginPresenter';
import { instance, mock, verify } from '@typestrong/ts-mockito';

library.add(fab);

describe('Login Component', () => {
    it('starts with the sign in button disabled', () => {
        const { signInButton } = renderLoginAndGetElement('/');
        expect(signInButton).toBeDisabled();
    });

    it('enables the sign in button when the alias and password fields have text', async () => {
        const { signInButton, aliasField, passwordField, user } = renderLoginAndGetElement('/');
        await user.type(aliasField, 'test');
        await user.type(passwordField, 'test');
        expect(signInButton).toBeEnabled();
    });

    it('disables the sign in button if either the alias or the password field is cleared', async () => {
        const { signInButton, aliasField, passwordField, user } = renderLoginAndGetElement('/');
        await user.type(aliasField, 'test');
        await user.type(passwordField, 'test');
        expect(signInButton).toBeEnabled();
        await user.clear(aliasField);
        expect(signInButton).toBeDisabled();
        await user.type(aliasField, 'test');
        expect(signInButton).toBeEnabled();
        await user.clear(passwordField);
        expect(signInButton).toBeDisabled();
    });

    it('calls the presenter login method with correct parameters when the sign in button is pressed', async () => {
        const mockPresenter = mock<LoginPresenter>();
        const mockPresenterInstance = instance(mockPresenter);

        const testAlias = 'test';
        const testPassword = 'test';
        const testRememberMe = false;
        const testOriginalUrl = '/';

        const { signInButton, aliasField, passwordField, user } = renderLoginAndGetElement(
            testOriginalUrl,
            mockPresenterInstance
        );

        await user.type(aliasField, testAlias);
        await user.type(passwordField, testPassword);
        await user.click(signInButton);

        verify(mockPresenter.doLogin(testAlias, testPassword, testRememberMe, testOriginalUrl)).once();
    });
});

function renderLogin(originalUrl: string, presenter?: LoginPresenter) {
    return render(
        <MemoryRouter>
            {!!presenter ? (
                <Login presenter={presenter} originalUrl={originalUrl} />
            ) : (
                <Login originalUrl={originalUrl} />
            )}
        </MemoryRouter>
    );
}

function renderLoginAndGetElement(originalUrl: string, presenter?: LoginPresenter) {
    const user = userEvent.setup();

    renderLogin(originalUrl, presenter);

    const signInButton = screen.getByRole('button', { name: /Sign in/i });
    const aliasField = screen.getByLabelText('Alias');
    const passwordField = screen.getByLabelText('Password');

    return { user, signInButton, aliasField, passwordField };
}
