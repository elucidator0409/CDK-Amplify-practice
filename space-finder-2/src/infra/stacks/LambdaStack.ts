import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface LambdaStackProps extends StackProps {
    spacesTable: ITable 
}

export class LambdaStack extends Stack {

    public readonly spacesLambdaIntegration: LambdaIntegration ;

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        const spacesLambda = new NodejsFunction(this, 'SpacesLambda', {
            runtime: Runtime.NODEJS_LATEST,
            handler: 'handler',
            entry: (join(__dirname, '..', '..', 'services', 'spaces', 'handler.ts')),
            environment: {
                TABLE_NAME: props.spacesTable.tableName
            }
        });

        
        spacesLambda.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'dynamodb:Scan',
                'dynamodb:PutItem',
                'dynamodb:GetItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem'
              ],
            resources: [props.spacesTable.tableArn]
        }));
        

        this.spacesLambdaIntegration = new LambdaIntegration(spacesLambda)

    }
}