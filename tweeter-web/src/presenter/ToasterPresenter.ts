import { Toast } from '../components/toaster/Toast';

export interface ToasterView {
    deleteMessage: (messageId: string) => void;
}

export class ToasterPresenter {
    private readonly _view: ToasterView;

    public constructor(view: ToasterView) {
        this._view = view;
    }

    private get view() {
        return this._view;
    }

    public deleteExpiredToasts = (messageList: Toast[]) => {
        const now = Date.now();

        for (const message of messageList) {
            if (message.expirationMillisecond > 0 && message.expirationMillisecond < now) {
                this.view.deleteMessage(message.id);
            }
        }
    };
}
