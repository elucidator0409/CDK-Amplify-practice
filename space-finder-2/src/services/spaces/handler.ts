import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { postSpaces } from "./PostSpaces";
import { getSpaces } from "./GetSpaces";
import { updateSpaces } from "./UpdateSpaces";
import { deleteSpaces } from "./DeleteSpaces";
import { JSONError, MissingFieldError } from "../shared/Validator";
import { addCorsHeaders } from "../shared/Utils";

const ddbClient = new DynamoDBClient();
async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    let message: string = '';
    let response: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify(message),
    };

    // Xử lý preflight request OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            },
            body: ''
        };
        return response;
    }
    
    try {
        switch (event.httpMethod) {
            case 'GET':
                const getResponse =await getSpaces(event, ddbClient);
                response = getResponse;
                break
            case 'POST':       
                const postResponse =await postSpaces(event, ddbClient);
                response = postResponse;
                break 
            case 'PUT':       
                const putResponse =await updateSpaces(event, ddbClient);
                response = putResponse;
                break
            case 'DELETE':       
                const deleteResponse =await deleteSpaces(event, ddbClient);
                response = deleteResponse;
                break
            default:
                message = 'Unsupported HTTP method';
                break;
        }
    }
    catch (error) {
        console.error('Error processing request:', error);
        if (error instanceof MissingFieldError) {
            return {
                statusCode: 400,
                body: JSON.stringify(error.message),
            };
        }    
        if (error instanceof JSONError) {
            return {
                statusCode: 400,
                body: error.message,
            };
        }    
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error',
                error: (error as Error).message,
            }),
        };
    }


  
  
  return addCorsHeaders(response);
}

export { handler };