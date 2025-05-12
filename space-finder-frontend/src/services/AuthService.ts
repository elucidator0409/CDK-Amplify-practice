import { Amplify } from "aws-amplify"
import {  SignInOutput, fetchAuthSession, signIn, signOut } from "@aws-amplify/auth"
import { AuthStack } from "../../../space-finder-2/outputs.json"
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";


const awsRegion = "ap-southeast-2"

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: AuthStack.SpaceUserPoolId,
            userPoolClientId: AuthStack.SpaceUserPoolClientId,
            identityPoolId: AuthStack.SpaceIdentityPoolId,
        },
    }
})

export class AuthService {

    private user: SignInOutput | undefined;
    private userName: string = '';
    public jwtToken: string | undefined;
    private temoraryCredentials: object | undefined;

    public isAuthorized(){
        if (this.user) {
            return true;
        }
        return false;
    }

    public async login(userName: string, password: string):Promise<object | undefined> {
        try {
            console.log(AuthStack.SpaceUserPoolId)
            console.log(AuthStack.SpaceUserPoolClientId)
            console.log(AuthStack.SpaceIdentityPoolId)
            try {
                await signOut();
            } catch (error) {
                // Ignore errors from signOut as the user might not be signed in
                console.log("No active session to sign out from");
            }
            const signInOutput : SignInOutput = await signIn({
                username: userName, 
                password: password,
                options: {
                    authFlowType: 'USER_PASSWORD_AUTH',
                }
            });
            this.user = signInOutput;
            this.userName = userName;
            await this.generateIdToken();
            return this.user;
        }
        catch (error) {
            console.error(error);
            return undefined
        }
    }

    public async getTemporaryCredentials() {
        if (this.temoraryCredentials) {
            return this.temoraryCredentials;
        }
        this.temoraryCredentials = await this.generateTempCredentials();
        return this.temoraryCredentials;
    }
    
    private async generateTempCredentials(){
        const idToken = await this.getIdToken();

    if (!idToken) {
      throw new Error('No ID token available. User may not be authenticated.');
    }
    
    const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/${AuthStack.SpaceUserPoolId}`;
    const cognitoIdentity = new CognitoIdentityClient({
      credentials: fromCognitoIdentityPool({
        identityPoolId: AuthStack.SpaceIdentityPoolId,
        logins: {
          [cognitoIdentityPool]: idToken ,
        },
        clientConfig: { region: awsRegion }

      }),
    });
    const credentials = await cognitoIdentity.config.credentials();
    return credentials;
    }

    // public async logout():Promise<void> {
    //     try {
    //         await signOut();
    //         this.user = undefined;
    //         this.userName = '';
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    private async generateIdToken(){
        this.jwtToken = ( await fetchAuthSession()).tokens?.idToken?.toString();
    } 

    public getIdToken(){
        return this.jwtToken
    }

    public getUserName(){
        return this.userName
        }
}