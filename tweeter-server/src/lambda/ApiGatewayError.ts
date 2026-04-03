const hasApiPrefix = (message: string): boolean =>
    message.startsWith('bad-request:') ||
    message.startsWith('unauthorized:') ||
    message.startsWith('internal-server-error:');

export const toApiGatewayError = (error: unknown): Error => {
    if (error instanceof Error) {
        const message = error.message;
        if (hasApiPrefix(message)) {
            return error;
        }

        const normalized = message.toLowerCase();
        if (normalized.includes('invalid alias or password') || normalized.includes('unauthorized')) {
            return new Error(`unauthorized: ${message}`, { cause: error });
        }

        if (normalized.includes('invalid') || normalized.includes('missing') || normalized.includes('required')) {
            return new Error(`bad-request: ${message}`, { cause: error });
        }

        return new Error(`internal-server-error: ${message}`, { cause: error });
    }

    return new Error('internal-server-error: unexpected error');
};
