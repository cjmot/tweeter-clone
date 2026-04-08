import ImagesDAO from '../dao/ImagesDAO';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export default class S3ImagesDAO implements ImagesDAO {
    private client: S3Client;
    private bucketName: string;
    private region: string;

    public constructor(bucketName: string = process.env.IMAGES_BUCKET ?? '') {
        this.bucketName = bucketName;
        this.region = process.env.AWS_REGION ?? 'us-east-1';

        if (!this.bucketName) {
            throw new Error('internal-server-error: IMAGES_BUCKET is not configured');
        }

        this.client = new S3Client({ region: this.region });
    }

    public async uploadProfileImage(alias: string, imageBytes: Uint8Array, imageFileExtension: string): Promise<string> {
        const key = this.toProfileImageKey(alias, imageFileExtension);
        const contentType = this.toContentType(imageFileExtension);

        try {
            await this.client.send(
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: imageBytes,
                    ContentType: contentType,
                })
            );

            return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to upload profile image: ${error.message}`, { cause: error });
            }

            throw new Error('Failed to upload profile image');
        }
    }

    private toProfileImageKey(alias: string, imageFileExtension: string): string {
        const safeAlias = alias.startsWith('@') ? alias.substring(1) : alias;
        const ext = imageFileExtension.startsWith('.') ? imageFileExtension.substring(1) : imageFileExtension;
        return `profiles/${safeAlias}.${ext || 'png'}`;
    }

    private toContentType(imageFileExtension: string): string {
        const ext = imageFileExtension.startsWith('.')
            ? imageFileExtension.substring(1).toLowerCase()
            : imageFileExtension.toLowerCase();

        if (ext === 'jpg' || ext === 'jpeg') {
            return 'image/jpeg';
        }

        if (ext === 'gif') {
            return 'image/gif';
        }

        if (ext === 'webp') {
            return 'image/webp';
        }

        return 'image/png';
    }
}
