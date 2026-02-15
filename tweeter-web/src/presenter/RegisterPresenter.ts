import { Buffer } from "buffer";
import { ChangeEvent } from "react";
import { AuthService } from "../model.service/AuthService";
import { AuthPresenter, AuthView } from "./AuthPresenter";

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
    private imageBytes: Uint8Array = new Uint8Array();
    private imageFileExtension: string = "";
    private rememberMe: boolean = false;

    public constructor(view: RegisterView) {
        super(view);
        this.registerView = view;
        this.service = new AuthService();
    }

    public doRegister = async (
        firstName: string,
        lastName: string,
        alias: string,
        password: string
    ) => {
        // Not needed now, but will be needed when you make the request to the server in milestone 3.
        const imageStringBase64: string = Buffer.from(this.imageBytes).toString("base64");

        await this.doAuth(
            () =>
                this.service.register(
                    firstName,
                    lastName,
                    alias,
                    password,
                    imageStringBase64,
                    this.imageFileExtension
                ),
            (user) => `/feed/${user.alias}`,
            this.rememberMe,
            "Failed to register user because of exception"
        );
    };

    public setRememberMe = (rememberMe: boolean) => {
        this.rememberMe = rememberMe;
    };

    private parseImageFile = async (file: File): Promise<ImageFileData | null> => {
        try {
            const imageFileExtension = this.getFileExtension(file);
            if (!imageFileExtension) {
                throw new Error("Image file must have a valid extension");
            }

            const fileBuffer = await file.arrayBuffer();
            const imageBytes = new Uint8Array(fileBuffer);

            return { imageBytes, imageFileExtension };
        } catch (error) {
            this.view.displayErrorMessage(`Failed to process image file because of exception: ${error}`);
            return null;
        }
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
                this.imageBytes = imageFileData.imageBytes;
                this.imageFileExtension = imageFileData.imageFileExtension;
                this.registerView.setImageFileExtension(imageFileData.imageFileExtension);
            } else {
                this.imageBytes = new Uint8Array();
                this.imageFileExtension = "";
                this.registerView.setImageFileExtension("");
            }
        } else {
            this.registerView.setImageUrl("");
            this.imageBytes = new Uint8Array();
            this.imageFileExtension = "";
            this.registerView.setImageFileExtension("");
        }
    };

    private getFileExtension = (file: File): string | undefined => {
        return file.name.split(".").pop();
    };
}
