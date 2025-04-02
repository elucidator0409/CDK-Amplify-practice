import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { postSpaces } from "./PostSpaces";
import { getSpaces } from "./GetSpaces";
import { updateSpaces } from "./UpdateSpaces";
import { deleteSpaces } from "./DeleteSpaces";
import { JSONError, MissingFieldError } from "../shared/Validator";

const ddbClient = new DynamoDBClient();
async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    let message : string;
    try {
        switch (event.httpMethod) {
            case 'GET':
                const getResponse =await getSpaces(event, ddbClient);
                return getResponse;
            case 'POST':       
                const postResponse =await postSpaces(event, ddbClient);
                return postResponse; 
            case 'PUT':       
                const putResponse =await updateSpaces(event, ddbClient);
                console.log('putResponse', putResponse);
                return putResponse;  
            case 'DELETE':       
                const deleteResponse =await deleteSpaces(event, ddbClient);
                console.log('deleteResponse', deleteResponse);
                return deleteResponse;
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


  const response: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify(message),
  };
  console.log(event);

  return response;
}

export { handler };