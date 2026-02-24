import { ChangeEvent } from 'react';
import { AuthPresenter, AuthView } from './AuthPresenter';

interface ImageFileData {
    imageBytes: Uint8Array;
    imageFileExtension: string;
}

export interface RegisterView extends AuthView {
    setImageUrl: (imageUrl: string) => void;
    setImageFileExtension: (imageFileExtension: string) => void;
}

export class RegisterPresenter extends AuthPresenter<RegisterView> {
    private imageFileExtension: string = '';
    private rememberMe: boolean = false;

    public doRegister = async (firstName: string, lastName: string, alias: string, password: string) => {
        await this.doAuth(
            () => this.authService.register(firstName, lastName, alias, password, this.imageFileExtension),
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
                this.imageFileExtension = imageFileData.imageFileExtension;
                this.view.setImageFileExtension(imageFileData.imageFileExtension);
            } else {
                this.imageFileExtension = '';
                this.view.setImageFileExtension('');
            }
        } else {
            this.view.setImageUrl('');
            this.imageFileExtension = '';
            this.view.setImageFileExtension('');
        }
    };

    private getFileExtension = (file: File): string | undefined => {
        return file.name.split('.').pop();
    };
}
