import { useRef } from 'react';
import { useMessageActions } from '../../toaster/MessageHooks';
import { OAuthPresenter, OAuthView } from '../../../presenter/OAuthPresenter';
import OAuthButton from './OAuthButton';

const OAuth = () => {
    const { displayInfoMessage } = useMessageActions();

    const view: OAuthView = {
        displayInfoMessage: displayInfoMessage,
    };

    const presenterRef = useRef<OAuthPresenter | null>(null);
    if (!presenterRef.current) {
        presenterRef.current = new OAuthPresenter(view);
    }

    return (
        <div className="text-center mb-3">
            <OAuthButton
                onButtonClick={() => presenterRef.current!.displayOAuthNotImplementedMessage('Google')}
                oAuthName="Google"
                iconName="google"
            />

            <OAuthButton
                onButtonClick={() => presenterRef.current!.displayOAuthNotImplementedMessage('Facebook')}
                oAuthName="Facebook"
                iconName="facebook"
            />

            <OAuthButton
                onButtonClick={() => presenterRef.current!.displayOAuthNotImplementedMessage('Twitter')}
                oAuthName="Twitter"
                iconName="twitter"
            />

            <OAuthButton
                onButtonClick={() => presenterRef.current!.displayOAuthNotImplementedMessage('LinkedIn')}
                oAuthName="LinkedIn"
                iconName="linkedin"
            />

            <OAuthButton
                onButtonClick={() => presenterRef.current!.displayOAuthNotImplementedMessage('Github')}
                oAuthName="Github"
                iconName="github"
            />
        </div>
    );
};

export default OAuth;
