import { APIGatewayAuthorizerEvent, APIGatewayProxyCallback, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { v4 } from "uuid";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({  });
async function handler(event: APIGatewayProxyEvent, context: Context){

  const command = new ListBucketsCommand({});
  const listBucketsResult = (await s3Client.send(command)).Buckets;

  const response: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify({
      message: ('Hello from lambda! Here are your bucket: ' + JSON.stringify(listBucketsResult))
    })
  };
  console.log(event);

  return response;
}

export { handler };