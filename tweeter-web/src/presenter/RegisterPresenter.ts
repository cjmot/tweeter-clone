import { Buffer } from "buffer";
import { AuthService } from "../model.service/AuthService";
import { AuthPresenter, AuthView } from "./AuthPresenter";

export interface ImageFileData {
    imageBytes: Uint8Array;
    imageFileExtension: string;
}

export class RegisterPresenter extends AuthPresenter {
    private readonly service: AuthService;

    public constructor(view: AuthView) {
        super(view);
        this.service = new AuthService();
    }

    public doRegister = async (
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        userImageBytes: Uint8Array,
        imageFileExtension: string,
        rememberMe: boolean
    ) => {
        // Not needed now, but will be needed when you make the request to the server in milestone 3.
        const imageStringBase64: string = Buffer.from(userImageBytes).toString("base64");

        await this.doAuth(
            () =>
                this.service.register(
                    firstName,
                    lastName,
                    alias,
                    password,
                    imageStringBase64,
                    imageFileExtension
                ),
            (user) => `/feed/${user.alias}`,
            rememberMe,
            "Failed to register user because of exception"
        );
    };

    public parseImageFile = async (file: File): Promise<ImageFileData | null> => {
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

    private getFileExtension = (file: File): string | undefined => {
        return file.name.split(".").pop();
    };
}
