/**
 * Archivo: lambda/updateUser.ts
 * Descripción: Actualiza la información de un usuario en DynamoDB
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const isLocal = process.env.USE_LOCALSTACK === "true";

const ddbClient = new DynamoDBClient({
  endpoint: isLocal ? "http://localhost:4566" : undefined,
  region: "us-east-1",
  credentials: isLocal
    ? { accessKeyId: "test", secretAccessKey: "test" }
    : undefined,
});

const USERS_TABLE = process.env.USERS_TABLE_NAME || "";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "El parámetro userId es obligatorio" }),
      };
    }
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Se requiere el body de la petición" }),
      };
    }

    const data = JSON.parse(event.body);
    const { name, email } = data;
    if (!name && !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Nada que actualizar" }),
      };
    }

    let updateExpression = "set";
    const ExpressionAttributeNames: Record<string, string> = {};
    const ExpressionAttributeValues: Record<string, any> = {};

    if (name) {
      updateExpression += " #name = :name,";
      ExpressionAttributeNames["#name"] = "name";
      ExpressionAttributeValues[":name"] = { S: name };
    }
    if (email) {
      updateExpression += " email = :email,";
      ExpressionAttributeValues[":email"] = { S: email };
    }
    updateExpression = updateExpression.slice(0, -1); // Eliminar la última coma

    const command = new UpdateItemCommand({
      TableName: USERS_TABLE,
      Key: { userId: { S: userId } },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const response = await ddbClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify(response.Attributes),
    };
  } catch (error) {
    console.error("Error actualizando el usuario: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
