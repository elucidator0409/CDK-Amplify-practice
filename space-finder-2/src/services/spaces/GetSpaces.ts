import { DynamoDBClient, GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

/**
 * Chuyển đổi một item DynamoDB sang JSON thông thường
 */
function convertDynamoItemToJson(item: any) {
    if (!item) {
        return item;
    }
    
    const result: any = {};
    
    for (const key in item) {
        const value = item[key];
        
        if (!value) {
            result[key] = value;
            continue;
        }
        
        // Xử lý các kiểu dữ liệu DynamoDB
        if (value.S !== undefined) {
            result[key] = value.S;
        } else if (value.N !== undefined) {
            result[key] = Number(value.N);
        } else if (value.BOOL !== undefined) {
            result[key] = value.BOOL;
        } else if (value.NULL !== undefined) {
            result[key] = null;
        } else if (value.L !== undefined) {
            result[key] = value.L.map((listItem: any) => convertDynamoItemToJson(listItem));
        } else if (value.M !== undefined) {
            result[key] = convertDynamoItemToJson(value.M);
        } else {
            result[key] = value;
        }
    }
    
    return result;
}

/**
 * Chuyển đổi một mảng các items DynamoDB sang JSON thông thường
 */
function convertDynamoItemsToJson(items: any[]) {
    if (!items) {
        return [];
    }
    return items.map(item => convertDynamoItemToJson(item));
}

/**
 * Xử lý GET request đến /spaces endpoint
 */
export async function getSpaces(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {
    console.log("GetSpaces event:", event);
    
    // Xử lý trường hợp tìm kiếm space theo ID
    if (event.queryStringParameters) {
        if ('id' in event.queryStringParameters) {
            const spaceId = event.queryStringParameters['id'];
            
            try {
                const getItemResponse = await ddbClient.send(new GetItemCommand({
                    TableName: process.env.TABLE_NAME,
                    Key: {
                        'id': { S: spaceId! }
                    }
                }));
                
                if (getItemResponse.Item) {
                    // Chuyển đổi DynamoDB item sang JSON thông thường
                    const convertedItem = convertDynamoItemToJson(getItemResponse.Item);
                    
                    return {
                        statusCode: 200,
                        body: JSON.stringify(convertedItem),
                    };
                } else {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({
                            message: `Space with id ${spaceId} not found!`
                        }),
                    };
                }
            } catch (error) {
                console.error("Error fetching item by ID:", error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: "Error fetching space",
                        error: error instanceof Error ? error.message : String(error)
                    }),
                };
            }
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "ID required!"
                }),
            };
        }
    }

    // Xử lý trường hợp lấy tất cả spaces
    try {
        const result = await ddbClient.send(new ScanCommand({
            TableName: process.env.TABLE_NAME,
        }));

        console.log("DynamoDB scan result:", result);

        // Chuyển đổi DynamoDB items sang JSON thông thường
        const convertedItems = convertDynamoItemsToJson(result.Items || []);
        
        return {
            statusCode: 200, // Đổi từ 201 sang 200 cho GET request
            body: JSON.stringify(convertedItems),
        };
    } catch (error) {
        console.error("Error scanning table:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error fetching spaces",
                error: error instanceof Error ? error.message : String(error)
            }),
        };
    }
}