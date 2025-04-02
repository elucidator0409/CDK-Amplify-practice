import { handler } from "../src/services/spaces/handler";

process.env.AWS_REGION = "ap-southeast-2";
process.env.TABLE_NAME = "SpacesStack-0af852f17239";

handler({
    httpMethod: 'POST',
    body: JSON.stringify({ location: 'Elu update' })
} as any , {} as any).then(result => {
    console.log('result', result);
})


// handler({
//     httpMethod: 'GET',
//     queryStringParameters: {
//         id: '4bc9ebc4-4f16-4384-b500-47cc8040b739'

//     }
// } as any , {} as any);

// handler({
//     httpMethod: 'PUT',
//     queryStringParameters: {
//         id: '4bc9ebc4-4f16-4384-b500-47cc8040b739'

//     },
//     body: JSON.stringify({ location: 'Elu update' })
// } as any , {} as any);


// handler({
//     httpMethod: 'DELETE',
//     queryStringParameters: {
//         id: '4bc9ebc4-4f16-4384-b500-47cc8040b739'

//     }
// } as any , {} as any);