import { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";


export async function updateSpaces(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {
    
    if(event.queryStringParameters && ('id'in event.queryStringParameters) && event.body){
        const spaceId = event.queryStringParameters['id'];
        const parsedBody = JSON.parse(event.body);
        const requestBodyKey = Object.keys(parsedBody)[0];
        const requestBodyValue = parsedBody[requestBodyKey];
        const updateResult = await ddbClient.send(new UpdateItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'id': { S: spaceId! }
            },
            UpdateExpression: 'set #zzzNew = :new',
            ExpressionAttributeNames: {
                '#zzzNew': requestBodyKey
            },
            ExpressionAttributeValues: {
                ':new': { S: requestBodyValue }
            },
            ReturnValues: 'UPDATED_NEW'
        }));

        return {
            statusCode: 204,
            body: JSON.stringify(updateResult.Attributes)
        }
    }

    return {
        statusCode: 204,
        body: JSON.stringify({
            message: "Please provde right args!"
        }),
    }
   



  
}