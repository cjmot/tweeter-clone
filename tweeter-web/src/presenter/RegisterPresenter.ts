import { ChangeEvent } from 'react';
import { AuthPresenter, AuthView } from './AuthPresenter';

interface ImageFileData {
    imageBytes: Uint8Array;
    imageFileExtension: string;
}

export interface RegisterView extends AuthView {
    imageUrl: string;
    setImageUrl: (imageUrl: string) => void;
}

export class RegisterPresenter extends AuthPresenter<RegisterView> {
    private imageBytes: Uint8Array = new Uint8Array(0);
    private imageFileExtension: string = '';
    private rememberMe: boolean = false;

    public doRegister = async (firstName: string, lastName: string, alias: string, password: string) => {
        await this.doAuth(
            () =>
                this.authService.register(
                    firstName,
                    lastName,
                    alias,
                    password,
                    this.toBase64(this.imageBytes),
                    this.imageFileExtension
                ),
            (user) => `/feed/${user.alias}`,
            this.rememberMe,
            'register user'
        );
    };

    public setRememberMe = (rememberMe: boolean) => {
        this.rememberMe = rememberMe;
    };

    private parseImageFile = async (file: File): Promise<ImageFileData | null> => {
        let imageFileExtension: string | undefined = undefined;
        await this.doFailureReportingOperation(async () => {
            imageFileExtension = this.getFileExtension(file);
            if (!imageFileExtension) {
                throw new Error('Image file must have a valid extension');
            }
        }, 'parse image file');

        const fileBuffer = await file.arrayBuffer();
        const imageBytes = new Uint8Array(fileBuffer);
        return imageFileExtension ? { imageBytes, imageFileExtension } : null;
    };

    public handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        await this.handleImageFile(file);
    };

    private handleImageFile = async (file: File | undefined) => {
        if (file) {
            this.view.setImageUrl(URL.createObjectURL(file));
            const imageFileData = await this.parseImageFile(file);
            if (imageFileData) {
                this.imageBytes = imageFileData.imageBytes;
                this.imageFileExtension = imageFileData.imageFileExtension;
            } else {
                this.imageBytes = new Uint8Array(0);
                this.imageFileExtension = '';
            }
        } else {
            this.view.setImageUrl('');
            this.imageBytes = new Uint8Array(0);
            this.imageFileExtension = '';
        }
    };

    private getFileExtension = (file: File): string | undefined => {
        return file.name.split('.').pop();
    };

    private toBase64(bytes: Uint8Array): string {
        let binary = '';
        for (const byte of bytes) {
            binary += String.fromCharCode(byte);
        }
        return btoa(binary);
    }
}
