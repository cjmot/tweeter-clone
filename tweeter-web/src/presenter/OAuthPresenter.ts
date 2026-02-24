import { Presenter, MessageView } from './Presenter';

export class OAuthPresenter extends Presenter<MessageView> {
    public displayOAuthNotImplementedMessage = (providerName: string) => {
        this.view.displayInfoMessage(`${providerName} registration is not implemented.`, 3000, 'text-white bg-primary');
    };
}
