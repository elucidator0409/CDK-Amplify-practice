import { DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";


export async function deleteSpaces(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {
    
    if(event.queryStringParameters && ('id' in event.queryStringParameters)){
        
            const spaceId = event.queryStringParameters['id'];
            ddbClient.send(new DeleteItemCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    'id': { S: spaceId! }
                }
            }))
           
            return {
                statusCode: 200,
                body: JSON.stringify(`Space with id ${spaceId} deleted!`),
            }
        

    }



    return {
        statusCode: 400,
        body: JSON.stringify('Please provide right arg'
        ),
    }
}