# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

Outputs:
https://ap3xzldn0c.execute-api.us-east-1.amazonaws.com/prod/

AwsBackendUsersStack.UsersApiEndpointB5FC4B1D = https://mhbdgzoej1.execute-api.us-east-1.amazonaws.com/prod/
Stack ARN:
arn:aws:cloudformation:us-east-1:122610496028:stack/AwsBackendUsersStack/d8065ea0-e0a0-11ef-b0e9-12c72063c265

API_URL="https://ap3xzldn0c.execute-api.us-east-1.amazonaws.com/prod/properties"

docker compose up -d
./scripts/init-localstack.sh
cdklocal bootstrap
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

# Then:

cdklocal bootstrap
cdklocal deploy

awslocal dynamodb list-tables
awslocal s3 ls
awslocal apigateway get-rest-apis
