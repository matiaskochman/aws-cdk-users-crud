/**
 * Archivo: lambda/listUsers.ts
 * Descripción: Lista todos los usuarios desde DynamoDB
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

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
    const command = new ScanCommand({ TableName: USERS_TABLE });
    const response = await ddbClient.send(command);
    const users =
      response.Items?.map((item) => ({
        userId: item.userId.S,
        email: item.email.S,
        name: item.name.S,
        createdAt: item.createdAt.S,
      })) || [];

    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  } catch (error) {
    console.error("Error listando usuarios: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
