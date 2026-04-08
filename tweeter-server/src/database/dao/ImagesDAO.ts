import TweeterDAO from './TweeterDAO';

export default interface ImagesDAO extends TweeterDAO {
    uploadProfileImage(alias: string, imageBytes: Uint8Array, imageFileExtension: string): Promise<string>;
}
