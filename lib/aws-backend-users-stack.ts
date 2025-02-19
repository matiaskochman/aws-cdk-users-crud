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

    // Tabla de usuarios existente
    const usersTable = new dynamodb.Table(this, "UsersTable", {
      tableName: "Users",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
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

    // Bucket para uploads de usuarios
    const userUploadsBucket = new s3.Bucket(this, "UserUploadsBucket", {
      bucketName: "user-uploads-cdk-v1",
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Nueva tabla para propiedades en alquiler
    const propertiesTable = new dynamodb.Table(this, "PropertiesTable", {
      tableName: "Properties",
      partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // (Opcional) Configuración de escalado automático para la tabla de propiedades
    const propertiesReadScaling = propertiesTable.autoScaleReadCapacity({
      minCapacity: 5,
      maxCapacity: 50,
    });
    propertiesReadScaling.scaleOnUtilization({
      targetUtilizationPercent: 70,
    });

    const propertiesWriteScaling = propertiesTable.autoScaleWriteCapacity({
      minCapacity: 5,
      maxCapacity: 50,
    });
    propertiesWriteScaling.scaleOnUtilization({
      targetUtilizationPercent: 70,
    });

    // Lambdas para usuarios (sin cambios respecto a la versión anterior)
    const createUserLambda = new lambdaNodejs.NodejsFunction(
      this,
      "CreateUserFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/users/createUser.ts"),
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
        entry: path.join(__dirname, "../lambda/users/getUser.ts"),
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
        entry: path.join(__dirname, "../lambda/users/listUsers.ts"),
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
        entry: path.join(__dirname, "../lambda/users/updateUser.ts"),
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
        entry: path.join(__dirname, "../lambda/users/deleteUser.ts"),
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
        entry: path.join(__dirname, "../lambda/users/generateUploadUrl.ts"),
        handler: "handler",
        environment: { BUCKET_NAME: userUploadsBucket.bucketName },
      }
    );
    userUploadsBucket.grantPut(generateUploadUrlLambda);
    userUploadsBucket.grantRead(generateUploadUrlLambda);

    // Lambdas para gestionar propiedades en alquiler
    const createPropertyLambda = new lambdaNodejs.NodejsFunction(
      this,
      "CreatePropertyFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/properties/createProperty.ts"),
        handler: "handler",
        environment: {
          PROPERTIES_TABLE_NAME: propertiesTable.tableName,
        },
      }
    );
    propertiesTable.grantWriteData(createPropertyLambda);

    const getPropertyLambda = new lambdaNodejs.NodejsFunction(
      this,
      "GetPropertyFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/properties/getProperty.ts"),
        handler: "handler",
        environment: { PROPERTIES_TABLE_NAME: propertiesTable.tableName },
      }
    );
    propertiesTable.grantReadData(getPropertyLambda);

    const listPropertiesLambda = new lambdaNodejs.NodejsFunction(
      this,
      "ListPropertiesFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/properties/listProperties.ts"),
        handler: "handler",
        environment: { PROPERTIES_TABLE_NAME: propertiesTable.tableName },
      }
    );
    propertiesTable.grantReadData(listPropertiesLambda);

    const updatePropertyLambda = new lambdaNodejs.NodejsFunction(
      this,
      "UpdatePropertyFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/properties/updateProperty.ts"),
        handler: "handler",
        environment: { PROPERTIES_TABLE_NAME: propertiesTable.tableName },
      }
    );
    propertiesTable.grantReadWriteData(updatePropertyLambda);

    const deletePropertyLambda = new lambdaNodejs.NodejsFunction(
      this,
      "DeletePropertyFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/properties/deleteProperty.ts"),
        handler: "handler",
        environment: { PROPERTIES_TABLE_NAME: propertiesTable.tableName },
      }
    );
    propertiesTable.grantWriteData(deletePropertyLambda);

    // API Gateway sin seguridad (para pruebas iniciales)
    const api = new apigateway.RestApi(this, "UsersAndPropertiesApi", {
      restApiName: "Users & Properties Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Endpoints para usuarios
    const usersResource = api.root.addResource("users");
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

    // Endpoints para propiedades en alquiler
    const propertiesResource = api.root.addResource("properties");
    propertiesResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createPropertyLambda)
    );
    propertiesResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(listPropertiesLambda)
    );

    const propertyIdResource = propertiesResource.addResource("{id}");
    propertyIdResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getPropertyLambda)
    );
    propertyIdResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(updatePropertyLambda)
    );
    propertyIdResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(deletePropertyLambda)
    );

    // Dentro del stack, luego de crear la función addOccupationLambda
    const addOccupationLambda = new lambdaNodejs.NodejsFunction(
      this,
      "AddOccupationFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../lambda/properties/addOccupation.ts"),
        handler: "handler",
        environment: { PROPERTIES_TABLE_NAME: propertiesTable.tableName },
      }
    );
    propertiesTable.grantWriteData(addOccupationLambda);
    // Suponiendo que ya tienes definido el recurso para propiedades (propertyIdResource)
    const addOccupationResource = propertyIdResource.addResource("occupy");
    addOccupationResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(addOccupationLambda)
    );
  }
}
