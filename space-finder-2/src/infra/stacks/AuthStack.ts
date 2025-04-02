import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../Utils';
import { CfnUserPoolGroup, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';

export class AuthStack extends Stack {

    public userPool!: UserPool;
    private userPoolClient!: UserPoolClient;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.createUserPool();
        this.createUserPoolClient();
    }

    private createUserPool(){
        this.userPool = new UserPool(this, 'SpaceUserPool', {
            selfSignUpEnabled: true,
            signInAliases: {
                username: true,
                email: true
            },
            
        });

        new CfnOutput(this, 'SpaceUserPoolId', {
            value: this.userPool.userPoolId,        
        })
    };
    private createUserPoolClient(){
        this.userPoolClient = this.userPool.addClient('SpaceUserPoolClient', {
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userPassword: true,
                userSrp: true
            }
        });

        new CfnOutput(this, 'SpaceUserPoolClientId', {
            value: this.userPoolClient.userPoolClientId,        
        })
    };


    private creaeteAdminsGroup(){
        new CfnUserPoolGroup(this, 'SpaceADmins', {
            userPoolId: this.userPool.userPoolId,
            groupName: 'admins',
        })
    }
}