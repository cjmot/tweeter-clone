import { Buffer } from 'buffer';
import { ChangeEvent } from 'react';
import { AuthService } from '../model.service/AuthService';
import { AuthPresenter, AuthView } from './AuthPresenter';

interface ImageFileData {
    imageBytes: Uint8Array;
    imageFileExtension: string;
}

export interface RegisterView extends AuthView {
    setImageUrl: (imageUrl: string) => void;
    setImageFileExtension: (imageFileExtension: string) => void;
}

export class RegisterPresenter extends AuthPresenter {
    private readonly registerView: RegisterView;
    private readonly service: AuthService;
    private imageFileExtension: string = '';
    private rememberMe: boolean = false;

    public constructor(view: RegisterView) {
        super(view);
        this.registerView = view;
        this.service = new AuthService();
    }

    public doRegister = async (firstName: string, lastName: string, alias: string, password: string) => {
        await this.doAuth(
            () => this.service.register(firstName, lastName, alias, password, this.imageFileExtension),
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
            this.registerView.setImageUrl(URL.createObjectURL(file));
            const imageFileData = await this.parseImageFile(file);
            if (imageFileData) {
                this.imageFileExtension = imageFileData.imageFileExtension;
                this.registerView.setImageFileExtension(imageFileData.imageFileExtension);
            } else {
                this.imageFileExtension = '';
                this.registerView.setImageFileExtension('');
            }
        } else {
            this.registerView.setImageUrl('');
            this.imageFileExtension = '';
            this.registerView.setImageFileExtension('');
        }
    };

    private getFileExtension = (file: File): string | undefined => {
        return file.name.split('.').pop();
    };
}
