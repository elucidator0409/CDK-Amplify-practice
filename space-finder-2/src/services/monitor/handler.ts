import { SNSEvent } from "aws-lambda";

const webHookUrl = 'https://hooks.slack.com/services/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';


async function handler(event: SNSEvent, context: any) {
    for (const record of event.Records) {
        await fetch(webHookUrl, {
            method: 'POST',
            body: JSON.stringify({
                "text": `Elu, we have a problem: ${record.Sns.Message}`
            })
        })
    }
}


export { handler }