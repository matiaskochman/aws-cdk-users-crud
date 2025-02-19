/**
 * Archivo: lambda/getUser.ts
 * Descripción: Obtiene un usuario por ID desde DynamoDB
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

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

    const command = new GetItemCommand({
      TableName: USERS_TABLE,
      Key: { userId: { S: userId } },
    });

    const response = await ddbClient.send(command);

    if (!response.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Usuario no encontrado" }),
      };
    }

    const user = {
      userId: response.Item.userId.S,
      email: response.Item.email.S,
      name: response.Item.name.S,
      createdAt: response.Item.createdAt.S,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    console.error("Error obteniendo el usuario: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
