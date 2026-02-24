import { Toast } from '../components/toaster/Toast';
import { MessageView, Presenter } from './Presenter';

export class ToasterPresenter extends Presenter<MessageView> {
    public deleteExpiredToasts = (messageList: Toast[]) => {
        const now = Date.now();

        for (const message of messageList) {
            if (message.expirationMillisecond > 0 && message.expirationMillisecond < now) {
                this.view.deleteMessage(message.id);
            }
        }
    };
}
