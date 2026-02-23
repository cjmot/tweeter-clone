export interface OAuthView {
    displayInfoMessage: (message: string, duration: number, bootstrapClasses?: string) => void;
}

export class OAuthPresenter {
    private readonly _view: OAuthView;

    public constructor(view: OAuthView) {
        this._view = view;
    }

    private get view() {
        return this._view;
    }

    public displayOAuthNotImplementedMessage = (providerName: string) => {
        this.view.displayInfoMessage(`${providerName} registration is not implemented.`, 3000, 'text-white bg-primary');
    };
}
