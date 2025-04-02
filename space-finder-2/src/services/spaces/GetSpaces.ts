import { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";


export async function getSpaces(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {
    
    if(event.queryStringParameters){
        if('id' in event.queryStringParameters){
            const spaceId = event.queryStringParameters['id'];
            const getItemResponse = await ddbClient.send(new GetItemCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    'id': { S: spaceId! }
                }
            }))
            if (getItemResponse.Item) {
                return {
                    statusCode: 200,
                    body: JSON.stringify(getItemResponse.Item),
                }
            } else {
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: `Space with id ${spaceId} not found!`
                    }),
                }
            }
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "ID required!"
                }),
            }
        }

    }

    const result = await ddbClient.send(new ScanCommand({
        TableName: process.env.TABLE_NAME,
      
    }));

    console.log(result);

    return {
        statusCode: 201,
        body: JSON.stringify(
              result.Items
        ),
    }
}