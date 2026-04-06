import { TweeterRequest, TweeterResponse } from 'tweeter-shared';

export class ClientCommunicator {
    private static readonly AUTH_EXPIRED_EVENT = 'tweeter:auth-expired';
    private SERVER_URL: string;

    public constructor(SERVER_URL: string) {
        this.SERVER_URL = SERVER_URL;
    }

    public async doPost<REQ extends TweeterRequest, RES extends TweeterResponse>(
        req: REQ | undefined,
        endpoint: string,
        headers?: Headers
    ): Promise<RES> {
        if (headers && req) {
            headers.append('Content-type', 'application/json');
        } else if (req) {
            headers = new Headers({
                'Content-type': 'application/json',
            });
        }

        const url = this.getUrl(endpoint);
        const params = this.getParams('POST', headers, req ? JSON.stringify(req) : req);

        try {
            const resp: Response = await fetch(url, params);

            if (resp.ok) {
                // Be careful with the return type here. resp.json() returns Promise<any> which means there is no type checking on response.
                const response: RES = await resp.json();
                return response;
            } else {
                const serverErrorMessage = await this.readErrorMessage(resp);
                const userMessage = this.toUserMessage(resp.status, endpoint, serverErrorMessage);
                throw new Error(userMessage);
            }
        } catch (error) {
            console.error(error);
            throw new Error((error as Error).message);
        }
    }

    private async readErrorMessage(resp: Response): Promise<string | null> {
        try {
            const payload = (await resp.json()) as { error?: string; message?: string; errorMessage?: string };
            return payload.error ?? payload.message ?? payload.errorMessage ?? null;
        } catch {
            return null;
        }
    }

    private toUserMessage(status: number, endpoint: string, serverMessage: string | null): string {
        const normalizedServerMessage = (serverMessage ?? '').toLowerCase();

        if (status === 401) {
            if (normalizedServerMessage === 'unauthorized: invalid-credentials' || endpoint === '/auth/login') {
                return 'Wrong username or password';
            }

            window.dispatchEvent(new Event(ClientCommunicator.AUTH_EXPIRED_EVENT));
            return 'Your session has expired. Please sign in again.';
        }

        if (status === 400) {
            if (normalizedServerMessage === 'bad-request: invalid-request') {
                return 'Invalid request';
            }

            return serverMessage ?? 'Invalid request';
        }

        if (status >= 500) {
            return 'Server error. Please try again.';
        }

        return serverMessage ?? `Request failed with status ${status}`;
    }

    private getUrl(endpoint: string): string {
        return this.SERVER_URL + endpoint;
    }

    private getParams(method: string, headers?: Headers, body?: BodyInit): RequestInit {
        const params: RequestInit = { method: method };

        if (headers) {
            params.headers = headers;
        }

        if (body) {
            params.body = body;
        }

        return params;
    }
}
