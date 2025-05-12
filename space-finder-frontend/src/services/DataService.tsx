import {  S3Client } from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { AuthService } from "./AuthService";
import { DataStack, ApiStack } from "../../../space-finder-2/outputs.json";
import { Upload } from "@aws-sdk/lib-storage";
import { SpaceEntry } from "../components/model/model";

const spacesUrl = ApiStack.SpaceApiEndpointDA7E4050 + "space";


export class DataService {

    private authService: AuthService;
    private s3Client: S3Client | undefined;
    private awsRegion: string = "ap-southeast-2";

    constructor(authService: AuthService){
        this.authService = authService;
    }

    public reserveSpace(spaceId: string) {
        return '123';
    }

    public async getSpaces():Promise<SpaceEntry[]>{
        const getSpacesResult = await fetch(spacesUrl, {
            method: 'GET',
            headers: {
                'Authorization': this.authService.jwtToken!
            }
        });
        const getSpacesResultJson = await getSpacesResult.json();
        return getSpacesResultJson;
    }


    public async createSpace(name: string, location:string, photo?: File){
        interface Space {
            name: string;
            location: string;
            photoUrl?: string;
        }

        const space: Space = {
            name: name,
            location: location
        };
        if (photo) {
            const uploadUrl = await this.uploadPublicFile(photo);
            space.photoUrl = uploadUrl
        }
        const postResult = await fetch(spacesUrl, {
            method: 'POST',
            body: JSON.stringify(space),
            headers: {
                'Authorization': this.authService.jwtToken!
            }
        });
        const postResultJSON = await postResult.json();
        return postResultJSON.id
    }

    private async uploadPublicFile(file: File){
        try{
            const credentials = await this.authService.getTemporaryCredentials();
            if (!this.s3Client) {
                this.s3Client = new S3Client({
                    credentials: credentials as AwsCredentialIdentity,
                    region: this.awsRegion
                });
            }
            const upload = new Upload({
                client: this.s3Client,
                params: {
                    Bucket: DataStack.SpaceFinderPhotosBucketName,
                    Key: file.name,
                    ACL: 'public-read',
                    Body: file
                }
            });
        
            await upload.done();
            return `https://${DataStack.SpaceFinderPhotosBucketName}.s3.${this.awsRegion}.amazonaws.com/${file.name}`;

        } catch (error) {
            console.error("Error uploading file: ", error);
            throw error;
        }    
    }

    public isAuthorized(){
        return this.authService.isAuthorized();
    }
}