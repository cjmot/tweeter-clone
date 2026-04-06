const hasApiPrefix = (message: string): boolean =>
    message.startsWith('bad-request:') ||
    message.startsWith('unauthorized:') ||
    message.startsWith('internal-server-error:');

const safeUnauthorizedMessages = new Set([
    'unauthorized: invalid-credentials',
    'unauthorized: invalid-session',
    'unauthorized: session-expired',
]);

const sanitizePrefixedMessage = (message: string): string => {
    if (message.startsWith('unauthorized:')) {
        if (safeUnauthorizedMessages.has(message)) {
            return message;
        }

        return 'unauthorized: unauthorized';
    }

    if (message.startsWith('bad-request:')) {
        return 'bad-request: invalid-request';
    }

    if (message.startsWith('internal-server-error:')) {
        return 'internal-server-error: internal-server-error';
    }

    return message;
};

export const toApiGatewayError = (error: unknown): Error => {
    if (error instanceof Error) {
        const message = error.message;
        if (hasApiPrefix(message)) {
            return new Error(sanitizePrefixedMessage(message), { cause: error });
        }

        const normalized = message.toLowerCase();

        if (normalized.includes('invalid') || normalized.includes('missing') || normalized.includes('required')) {
            return new Error('bad-request: invalid-request', { cause: error });
        }

        return new Error('internal-server-error: internal-server-error', { cause: error });
    }

    return new Error('internal-server-error: internal-server-error');
};
