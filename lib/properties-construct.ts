import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

export class PropertiesConstruct extends Construct {
  public readonly createPropertyLambda: lambda.Function;
  public readonly getPropertyLambda: lambda.Function;
  public readonly listPropertiesLambda: lambda.Function;
  public readonly updatePropertyLambda: lambda.Function;
  public readonly deletePropertyLambda: lambda.Function;
  public readonly addOccupationLambda: lambda.Function;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Tabla DynamoDB
    const propertiesTable = new dynamodb.Table(this, "PropertiesTable", {
      tableName: "Properties",
      partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Configuración de autoescalado
    this.configureAutoScaling(propertiesTable);

    // Lambdas
    this.createPropertyLambda = this.createLambdaFunction(
      "CreatePropertyFunction",
      "../lambda/properties/createProperty.ts",
      {
        PROPERTIES_TABLE_NAME: propertiesTable.tableName,
      }
    );

    this.getPropertyLambda = this.createLambdaFunction(
      "GetPropertyFunction",
      "../lambda/properties/getProperty.ts",
      {
        PROPERTIES_TABLE_NAME: propertiesTable.tableName,
      }
    );

    this.listPropertiesLambda = this.createLambdaFunction(
      "ListPropertiesFunction",
      "../lambda/properties/listProperties.ts",
      {
        PROPERTIES_TABLE_NAME: propertiesTable.tableName,
      }
    );

    this.updatePropertyLambda = this.createLambdaFunction(
      "UpdatePropertyFunction",
      "../lambda/properties/updateProperty.ts",
      {
        PROPERTIES_TABLE_NAME: propertiesTable.tableName,
      }
    );

    this.deletePropertyLambda = this.createLambdaFunction(
      "DeletePropertyFunction",
      "../lambda/properties/deleteProperty.ts",
      {
        PROPERTIES_TABLE_NAME: propertiesTable.tableName,
      }
    );

    this.addOccupationLambda = this.createLambdaFunction(
      "AddOccupationFunction",
      "../lambda/properties/addOccupation.ts",
      {
        PROPERTIES_TABLE_NAME: propertiesTable.tableName,
      }
    );

    // Permisos
    propertiesTable.grantReadWriteData(this.createPropertyLambda);
    propertiesTable.grantReadData(this.getPropertyLambda);
    propertiesTable.grantReadData(this.listPropertiesLambda);
    propertiesTable.grantReadWriteData(this.updatePropertyLambda);
    propertiesTable.grantWriteData(this.deletePropertyLambda);
    propertiesTable.grantWriteData(this.addOccupationLambda);
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
