import './Login.css';
import 'bootstrap/dist/css/bootstrap.css';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthenticationFormLayout from '../authenticationFormLayout/AuthenticationFormLayout';
import AuthenticationFields from '../authenticationFields/AuthenticationFields';
import { useMessageActions } from '../../toaster/MessageHooks';
import { useUserInfoActions } from '../../userInfo/UserHooks';
import { AuthView } from '../../../presenter/AuthPresenter';
import { LoginPresenter } from '../../../presenter/LoginPresenter';

interface Props {
    originalUrl?: string;
}

const Login = (props: Props) => {
    const [alias, setAlias] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { updateUserInfo } = useUserInfoActions();
    const { displayErrorMessage } = useMessageActions();

    const view: AuthView = {
        setIsLoading: setIsLoading,
        updateUserInfo: updateUserInfo,
        navigateTo: navigate,
        displayErrorMessage: displayErrorMessage,
    };

    const presenterRef = useRef<LoginPresenter | null>(null);
    if (!presenterRef.current) {
        presenterRef.current = new LoginPresenter(view);
    }

    const checkSubmitButtonStatus = (): boolean => {
        return !alias || !password;
    };

    const doLogin = async () => {
        await presenterRef.current!.doLogin(alias, password, rememberMe, props.originalUrl);
    };

    const inputFieldFactory = () => {
        return (
            <>
                <AuthenticationFields
                    onEnterHandler={doLogin}
                    checkSubmitButtonStatus={checkSubmitButtonStatus}
                    setAlias={setAlias}
                    setPassword={setPassword}
                />
            </>
        );
    };

    const switchAuthenticationMethodFactory = () => {
        return (
            <div className="mb-3">
                Not registered? <Link to="/register">Register</Link>
            </div>
        );
    };

    return (
        <AuthenticationFormLayout
            headingText="Please Sign In"
            submitButtonLabel="Sign in"
            oAuthHeading="Sign in with:"
            inputFieldFactory={inputFieldFactory}
            switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
            setRememberMe={setRememberMe}
            submitButtonDisabled={() => checkSubmitButtonStatus()}
            isLoading={isLoading}
            submit={doLogin}
        />
    );
};

export default Login;
