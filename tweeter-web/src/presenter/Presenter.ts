export interface View {
    displayErrorMessage: (message: string) => void;
}

export interface MessageView extends View {
    displayInfoMessage: (message: string, duration: number, bootstrapClasses?: string) => string;
    deleteMessage: (id: string) => void;
}

export abstract class Presenter<V extends View> {
    private _view: V;

    constructor(view: V) {
        this._view = view;
    }
    protected get view() {
        return this._view;
    }

    protected async doFailureReportingOperation(operation: () => Promise<void>, operationDescription: string) {
        try {
            await operation();
        } catch (error) {
            this.view.displayErrorMessage(
                `Failed to ${operationDescription} because of exception: ${(error as Error).message}`
            );
        }
    }

    protected async doLoadingOperation(
        view: Partial<MessageView> & { setIsLoading?: (isLoading: boolean) => void },
        operation: () => Promise<void>,
        operationDescription: string,
        toastMessage: string = 'Processing...'
    ): Promise<void> {
        const toastId = view.displayInfoMessage ? view.displayInfoMessage(toastMessage, 0) : undefined;
        try {
            if (view.setIsLoading) view.setIsLoading(true);
            await this.doFailureReportingOperation(operation, operationDescription);
        } finally {
            if (toastId && view.deleteMessage) view.deleteMessage(toastId);
            if (view.setIsLoading) view.setIsLoading(false);
        }
    }
}
