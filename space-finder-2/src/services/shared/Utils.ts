import { v4 } from "uuid";
import { JSONError } from "./Validator";
import { randomUUID } from "crypto";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";


export function createRandomId(){
    return randomUUID();
}

export function addCorsHeaders(arg: APIGatewayProxyResult){
    if(!arg.headers) {
        arg.headers = {};
    }
    arg.headers["Access-Control-Allow-Origin"] = "*";
    arg.headers["Access-Control-Allow-Methods"] = "*";
    arg.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token';

    return arg;
}


export function parseJSON(arg: string) {
    try {
        return JSON.parse(arg);
    } catch (error) {
        if (error instanceof Error) {
            throw new JSONError(error.message);
        }
        throw new JSONError("An unknown error occurred");
    }
}

export function hasAdminGroup(event: APIGatewayProxyEvent) {
    const groups = event.requestContext.authorizer?.claims["cognito:groups"];
    if (groups) {
        
        return (groups as string).includes('admins');
    }
    return false;
}