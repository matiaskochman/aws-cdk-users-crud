/**************/

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

export class AwsBackendUsersStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Creación de la tabla DynamoDB para usuarios
    const usersTable = new dynamodb.Table(this, "UsersTable", {
      tableName: "Users",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Ajusta según el entorno
    });

    usersTable.addGlobalSecondaryIndex({
      indexName: "EmailIndex",
      partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const readScaling = usersTable.autoScaleReadCapacity({
      minCapacity: 5,
      maxCapacity: 50,
    });
    readScaling.scaleOnUtilization({
      targetUtilizationPercent: 70,
    });

    const writeScaling = usersTable.autoScaleWriteCapacity({
      minCapacity: 5,
      maxCapacity: 50,
    });
    writeScaling.scaleOnUtilization({
      targetUtilizationPercent: 70,
    });

    // Bucket de S3 para uploads de usuarios
    const userUploadsBucket = new s3.Bucket(this, "UserUploadsBucket", {
      bucketName: "user-uploads-cdk-v1",
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Solo para testing; ajustar en producción
      autoDeleteObjects: true, // Para ambientes de prueba
    });

    // Se elimina la creación de recursos de Cognito
    // const userPool = new cognito.UserPool(this, "UserPool", { ... });
    // const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", { userPool });
    // const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, "CognitoAuthorizer", {
    //   cognitoUserPools: [userPool],
    // });

    // Definición de funciones Lambda
    const createUserLambda = new lambdaNodejs.NodejsFunction(
      this,
      "CreateUserFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/createUser.ts"),
        handler: "handler",
        environment: {
          USERS_TABLE_NAME: usersTable.tableName,
          BUCKET_NAME: userUploadsBucket.bucketName,
        },
      }
    );
    usersTable.grantWriteData(createUserLambda);
    userUploadsBucket.grantPut(createUserLambda);

    const getUserLambda = new lambdaNodejs.NodejsFunction(
      this,
      "GetUserFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/getUser.ts"),
        handler: "handler",
        environment: { USERS_TABLE_NAME: usersTable.tableName },
      }
    );
    usersTable.grantReadData(getUserLambda);

    const listUsersLambda = new lambdaNodejs.NodejsFunction(
      this,
      "ListUsersFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/listUsers.ts"),
        handler: "handler",
        environment: { USERS_TABLE_NAME: usersTable.tableName },
      }
    );
    usersTable.grantReadData(listUsersLambda);

    const updateUserLambda = new lambdaNodejs.NodejsFunction(
      this,
      "UpdateUserFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/updateUser.ts"),
        handler: "handler",
        environment: { USERS_TABLE_NAME: usersTable.tableName },
      }
    );
    usersTable.grantReadWriteData(updateUserLambda);

    const deleteUserLambda = new lambdaNodejs.NodejsFunction(
      this,
      "DeleteUserFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/deleteUser.ts"),
        handler: "handler",
        environment: { USERS_TABLE_NAME: usersTable.tableName },
      }
    );
    usersTable.grantWriteData(deleteUserLambda);

    const generateUploadUrlLambda = new lambdaNodejs.NodejsFunction(
      this,
      "GenerateUploadUrlFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/generateUploadUrl.ts"),
        handler: "handler",
        environment: { BUCKET_NAME: userUploadsBucket.bucketName },
      }
    );
    userUploadsBucket.grantPut(generateUploadUrlLambda);
    userUploadsBucket.grantRead(generateUploadUrlLambda);

    // Creación de la API Gateway sin autorización (para pruebas iniciales)
    const api = new apigateway.RestApi(this, "UsersApi", {
      restApiName: "Users Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const usersResource = api.root.addResource("users");

    // Métodos sin configuraciones de seguridad
    usersResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createUserLambda)
    );
    usersResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(listUsersLambda)
    );

    const userIdResource = usersResource.addResource("{userId}");
    userIdResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getUserLambda)
    );
    userIdResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(updateUserLambda)
    );
    userIdResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(deleteUserLambda)
    );

    const uploadUrlResource = api.root.addResource("upload-url");
    uploadUrlResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(generateUploadUrlLambda)
    );
  }
}
