import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { UsersConstruct } from "./users-construct";
import { PropertiesConstruct } from "./properties-construct";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class AwsBackendUsersStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Crear constructs
    const users = new UsersConstruct(this, "Users");
    const properties = new PropertiesConstruct(this, "Properties");

    // Configurar API Gateway
    const api = new apigateway.RestApi(this, "UsersAndPropertiesApi", {
      restApiName: "Users & Properties Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Configurar rutas de Users
    const usersResource = api.root.addResource("users");
    usersResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(users.createUserLambda)
    );
    usersResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(users.listUsersLambda)
    );

    const userIdResource = usersResource.addResource("{userId}");
    userIdResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(users.getUserLambda)
    );
    userIdResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(users.updateUserLambda)
    );
    userIdResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(users.deleteUserLambda)
    );

    // Configurar rutas de Properties
    const propertiesResource = api.root.addResource("properties");
    propertiesResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(properties.createPropertyLambda)
    );
    propertiesResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(properties.listPropertiesLambda)
    );

    const propertyIdResource = propertiesResource.addResource("{id}");
    propertyIdResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(properties.getPropertyLambda)
    );
    propertyIdResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(properties.updatePropertyLambda)
    );
    propertyIdResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(properties.deletePropertyLambda)
    );

    // Ruta para ocupaciones
    const addOccupationResource = propertyIdResource.addResource("occupy");
    addOccupationResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(properties.addOccupationLambda)
    );
  }
}
