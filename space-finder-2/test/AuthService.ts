import { SignInOutput, fetchAuthSession, signIn } from '@aws-amplify/auth';
import { Amplify } from 'aws-amplify';
 
Amplify.configure({
  Auth: {
    Cognito: {
        userPoolId: 'ap-southeast-2_SiFUTh95x', // Cognito User Pool ID
        userPoolClientId: '6ee9dmnr8gu9c9q8vrjv8d0d5r', // Cognito App Client ID
    },
  },
});
 
export class AuthService {
  public async login(username: string, password: string) {
    const result = (await signIn({
      username,
      password,
      options: {
        authFlowType: 'USER_PASSWORD_AUTH',
      },
    })) as SignInOutput;
    return result;
  }

  public async getIdToken(): Promise<string | null> {
    try {
        const authSession = await fetchAuthSession();
        const idToken = authSession.tokens?.idToken?.toString();
        return idToken || null; // Return the ID token or null if not available
    } catch (error) {
        console.error('Error fetching ID token:', error);
        throw error;
    }
}
}




