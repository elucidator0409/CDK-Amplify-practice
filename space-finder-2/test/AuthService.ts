import { SignInOutput, fetchAuthSession, signIn, getCurrentUser, confirmSignIn, updatePassword } from '@aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { AuthStack } from '../outputs.json'
 

const awsRegion = 'ap-southeast-2'; 

Amplify.configure({
  Auth: {
    Cognito: {
        userPoolId: 'ap-southeast-2_3ffKKEv0p', // Cognito User Pool ID
        userPoolClientId: '6tv22eq50g982n2c92nnjsqt3m', // Cognito App Client ID
        identityPoolId: 'ap-southeast-2:4b7520ba-def5-47c9-9acd-575ac4a5ec61', // Cognito Identity Pool ID
        
    },
  },
});
 
export class AuthService {
  public async login(username: string, password: string) {
    try {
      const result = (await signIn({
        username,
        password,
        options: {
          authFlowType: 'USER_PASSWORD_AUTH',
        },
      })) as SignInOutput;
      console.log('Login successful:', result);
      console.log('Next step:', result.nextStep);
    
    if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      console.log('New password required - completing with new password');
      const newPasswordResult = await confirmSignIn({
        challengeResponse: 'NewPassword123!'  // Đặt mật khẩu mới ở đây
      });
      console.log('Password change result:', newPasswordResult);
      return newPasswordResult;
    }
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  public async getIdToken(): Promise<string | null> {
    try {
      const authSession = await fetchAuthSession();
      console.log('Auth session:', authSession);
      const idToken = authSession.tokens?.idToken?.toString();
      console.log('ID Token exists:', !!idToken);
      return idToken || null;
    } catch (error) {
      console.error('Error fetching ID token:', error);
      throw error;
    }
  }
  public async generateTemporaryCredentials() {
    const idToken = await this.getIdToken();

    if (!idToken) {
      throw new Error('No ID token available. User may not be authenticated.');
    }
    
    const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/${AuthStack.SpaceUserPoolId}`;
    const cognitoIdentity = new CognitoIdentityClient({
      credentials: fromCognitoIdentityPool({
        identityPoolId: 'ap-southeast-2:4b7520ba-def5-47c9-9acd-575ac4a5ec61',
        logins: {
          [cognitoIdentityPool]: idToken ,
        },
        clientConfig: { region: awsRegion }

      }),
    });
    const credentials = await cognitoIdentity.config.credentials();
    return credentials;
  }

  public async checkCurrentUser() {
    try {
      const user = await getCurrentUser();
      console.log('Current user:', user);
      return user;
    } catch (error) {
      console.error('No current user:', error);
      return null;
    }
  }

  public async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      // Đảm bảo người dùng đã đăng nhập
      const currentUser = await this.checkCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user found. Please sign in first.');
      }
      
      // Đổi mật khẩu
      await updatePassword({
        oldPassword,
        newPassword
      });
      
      console.log('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
  
}




