import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

export class UsersConstruct extends Construct {
  public readonly createUserLambda: lambda.Function;
  public readonly getUserLambda: lambda.Function;
  public readonly listUsersLambda: lambda.Function;
  public readonly updateUserLambda: lambda.Function;
  public readonly deleteUserLambda: lambda.Function;
  public readonly generateUploadUrlLambda: lambda.Function;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Tabla DynamoDB
    const usersTable = new dynamodb.Table(this, "UsersTable", {
      tableName: "Users",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Configuración de autoescalado
    this.configureAutoScaling(usersTable);

    // Bucket S3
    const userUploadsBucket = new s3.Bucket(this, "UserUploadsBucket", {
      bucketName: "user-uploads-cdk-v1",
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Lambdas
    this.createUserLambda = this.createLambdaFunction(
      "CreateUserFunction",
      "../lambda/users/createUser.ts",
      {
        USERS_TABLE_NAME: usersTable.tableName,
        BUCKET_NAME: userUploadsBucket.bucketName,
      }
    );

    this.getUserLambda = this.createLambdaFunction(
      "GetUserFunction",
      "../lambda/users/getUser.ts",
      {
        USERS_TABLE_NAME: usersTable.tableName,
      }
    );

    this.listUsersLambda = this.createLambdaFunction(
      "ListUsersFunction",
      "../lambda/users/listUsers.ts",
      {
        USERS_TABLE_NAME: usersTable.tableName,
      }
    );

    this.updateUserLambda = this.createLambdaFunction(
      "UpdateUserFunction",
      "../lambda/users/updateUser.ts",
      {
        USERS_TABLE_NAME: usersTable.tableName,
      }
    );

    this.deleteUserLambda = this.createLambdaFunction(
      "DeleteUserFunction",
      "../lambda/users/deleteUser.ts",
      {
        USERS_TABLE_NAME: usersTable.tableName,
      }
    );

    this.generateUploadUrlLambda = this.createLambdaFunction(
      "GenerateUploadUrlFunction",
      "../lambda/users/generateUploadUrl.ts",
      {
        BUCKET_NAME: userUploadsBucket.bucketName,
      }
    );

    // Permisos
    usersTable.grantReadWriteData(this.createUserLambda);
    userUploadsBucket.grantPut(this.createUserLambda);
    usersTable.grantReadData(this.getUserLambda);
    usersTable.grantReadData(this.listUsersLambda);
    usersTable.grantReadWriteData(this.updateUserLambda);
    usersTable.grantWriteData(this.deleteUserLambda);
    userUploadsBucket.grantPut(this.generateUploadUrlLambda);
  }

  private configureAutoScaling(table: dynamodb.Table) {
    const readScaling = table.autoScaleReadCapacity({
      minCapacity: 5,
      maxCapacity: 50,
    });
    readScaling.scaleOnUtilization({ targetUtilizationPercent: 70 });

    const writeScaling = table.autoScaleWriteCapacity({
      minCapacity: 5,
      maxCapacity: 50,
    });
    writeScaling.scaleOnUtilization({ targetUtilizationPercent: 70 });
  }

  private createLambdaFunction(
    id: string,
    entry: string,
    environment: Record<string, string>
  ): lambdaNodejs.NodejsFunction {
    return new lambdaNodejs.NodejsFunction(this, id, {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, entry),
      handler: "handler",
      environment,
    });
  }
}
