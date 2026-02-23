import './Register.css';
import 'bootstrap/dist/css/bootstrap.css';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthenticationFormLayout from '../authenticationFormLayout/AuthenticationFormLayout';
import AuthenticationFields from '../authenticationFields/AuthenticationFields';
import { useMessageActions } from '../../toaster/MessageHooks';
import { useUserInfoActions } from '../../userInfo/UserHooks';
import { RegisterPresenter, RegisterView } from '../../../presenter/RegisterPresenter';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [alias, setAlias] = useState('');
    const [password, setPassword] = useState('');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [imageFileExtension, setImageFileExtension] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { updateUserInfo } = useUserInfoActions();
    const { displayErrorMessage } = useMessageActions();

    const view: RegisterView = {
        setIsLoading: setIsLoading,
        updateUserInfo: updateUserInfo,
        navigateTo: navigate,
        displayErrorMessage: displayErrorMessage,
        setImageUrl: setImageUrl,
        setImageFileExtension: setImageFileExtension,
    };

    const presenterRef = useRef<RegisterPresenter | null>(null);
    if (!presenterRef.current) {
        presenterRef.current = new RegisterPresenter(view);
    }

    const checkSubmitButtonStatus = (): boolean => {
        return !firstName || !lastName || !alias || !password || !imageUrl || !imageFileExtension;
    };

    const registerOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key == 'Enter' && !checkSubmitButtonStatus()) {
            doRegister();
        }
    };

    const doRegister = async () => {
        await presenterRef.current!.doRegister(firstName, lastName, alias, password);
    };

    const inputFieldFactory = () => {
        return (
            <>
                <div className="form-floating">
                    <input
                        type="text"
                        className="form-control"
                        size={50}
                        id="firstNameInput"
                        placeholder="First Name"
                        onKeyDown={registerOnEnter}
                        onChange={(event) => setFirstName(event.target.value)}
                    />
                    <label htmlFor="firstNameInput">First Name</label>
                </div>
                <div className="form-floating">
                    <input
                        type="text"
                        className="form-control"
                        size={50}
                        id="lastNameInput"
                        placeholder="Last Name"
                        onKeyDown={registerOnEnter}
                        onChange={(event) => setLastName(event.target.value)}
                    />
                    <label htmlFor="lastNameInput">Last Name</label>
                </div>

                <AuthenticationFields
                    onEnterHandler={doRegister}
                    checkSubmitButtonStatus={checkSubmitButtonStatus}
                    setAlias={setAlias}
                    setPassword={setPassword}
                />

                <div className="form-floating mb-3">
                    <input
                        type="file"
                        className="d-inline-block py-5 px-4 form-control bottom"
                        id="imageFileInput"
                        onKeyDown={registerOnEnter}
                        onChange={presenterRef.current!.handleFileChange}
                    />
                    {imageUrl.length > 0 && (
                        <>
                            <label htmlFor="imageFileInput">User Image</label>
                            <img src={imageUrl} className="img-thumbnail" alt=""></img>
                        </>
                    )}
                </div>
            </>
        );
    };

    const switchAuthenticationMethodFactory = () => {
        return (
            <div className="mb-3">
                Already registered? <Link to="/login">Sign in</Link>
            </div>
        );
    };

    return (
        <AuthenticationFormLayout
            headingText="Please Register"
            submitButtonLabel="Register"
            oAuthHeading="Register with:"
            inputFieldFactory={inputFieldFactory}
            switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
            setRememberMe={presenterRef.current!.setRememberMe}
            submitButtonDisabled={checkSubmitButtonStatus}
            isLoading={isLoading}
            submit={doRegister}
        />
    );
};

export default Register;
