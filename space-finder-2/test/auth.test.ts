import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { AuthService } from './AuthService';

// async function handleLoginRequest(username: string, password: string) {
//     const authService = new AuthService();

//     try {
//         // Log in the user
//         const loginResult = await authService.login(username, password);
//         console.log('Login successful:', loginResult);

//         // Get the JWT token
//         const idToken = await authService.getIdToken();
//         if (idToken) {
//             console.log('ID Token (JWT):', idToken);

//             return {
//                 statusCode: 200,
//                 body: JSON.stringify({ token: idToken }),
//             };
//         } else {
//             return {
//                 statusCode: 401,
//                 body: JSON.stringify({ message: 'Failed to retrieve ID token' }),
//             };
//         }
//     } catch (error) {
//         console.error('Error during login:', error);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ message: 'Internal server error' }),
//         };
//     }
// }

// handleLoginRequest('elucidator', 'Quockhanh0409**').then((response) => {
//     console.log('Response:', response);
// });


async function testAuth() {
    const service = new AuthService();
    const loginResult = await service.login(
        'elucidator',
        'Elucidator0409**'
    );
    console.log('Login successful:', !!loginResult);
    const currentUser = await service.checkCurrentUser();
    console.log('Current user available:', !!currentUser);
    const idToken = await service.getIdToken();
    const credentials = await service.generateTemporaryCredentials();
    console.log('Login id token successful:', idToken);
    // console.log(credentials)
    const buckets = await listBuckets(credentials);
    console.log('List buckets successful:', buckets);
}

async function listBuckets(credentials: any) {
    const client = new S3Client({
        credentials: credentials
    });

    const command = new ListBucketsCommand({});
    const result = await client.send(command);
    return result;

    
}

async function testChangePassword() {
    try {
        const service = new AuthService();
        
        // Đăng nhập trước
        console.log('Logging in...');
        const loginResult = await service.login('elucidator', 'NewPassword123!');
        console.log('Login successful:', !!loginResult);
        
        // Đổi mật khẩu (từ mật khẩu hiện tại sang mật khẩu mới)
        console.log('Changing password...');
        await service.changePassword('NewPassword123!', 'Elucidator0409**');
        console.log('Password changed successfully');
        
        // Kiểm tra đăng nhập với mật khẩu mới
        console.log('Testing login with new password...');
        const newLoginResult = await service.login('elucidator', 'Elucidator0409**');
        console.log('Login with new password successful:', !!newLoginResult);
        
        return { success: true, message: 'Password change flow completed successfully' };
    } catch (error) {
        console.error('Password change flow failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}

testAuth().then((response) => {
    console.log('Response:', response);
});

// testChangePassword().then((response) => {
//     console.log('Change password result:', response);
// });