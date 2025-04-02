import { v4 } from "uuid";
import { JSONError } from "./Validator";
import { randomUUID } from "crypto";
import { APIGatewayProxyEvent } from "aws-lambda";


export function createRandomId(){
    return randomUUID();
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