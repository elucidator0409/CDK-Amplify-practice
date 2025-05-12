import { SNSEvent } from "aws-lambda";
import { handler } from "../src/services/monitor/handler";

const SNSEvent : SNSEvent = {
    Records: [{
        Sns: {
            Message: "Test message",
        }
    }]
} as any;

handler(SNSEvent, {} as any)