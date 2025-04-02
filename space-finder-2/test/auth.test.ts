import { AuthService } from './AuthService';

async function handleLoginRequest(username: string, password: string) {
    const authService = new AuthService();

    try {
        // Log in the user
        const loginResult = await authService.login(username, password);
        console.log('Login successful:', loginResult);

        // Get the JWT token
        const idToken = await authService.getIdToken();
        if (idToken) {
            console.log('ID Token (JWT):', idToken);

            return {
                statusCode: 200,
                body: JSON.stringify({ token: idToken }),
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Failed to retrieve ID token' }),
            };
        }
    } catch (error) {
        console.error('Error during login:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
}

handleLoginRequest('elucidator', 'Quockhanh0409**').then((response) => {
    console.log('Response:', response);
});