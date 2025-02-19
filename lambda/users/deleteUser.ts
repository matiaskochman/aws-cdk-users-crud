/**
 * Archivo: lambda/deleteUser.ts
 * Descripción: Elimina un usuario de DynamoDB
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

const isLocal = process.env.USE_LOCALSTACK === "true";

const ddbClient = new DynamoDBClient({
  endpoint: isLocal ? "http://localhost:4566" : undefined,
  region: "us-east-1",
  credentials: isLocal
    ? { accessKeyId: "test", secretAccessKey: "test" }
    : undefined,
});

const s3Client = new S3Client({
  endpoint: isLocal ? "http://localhost:4566" : undefined,
  region: "us-east-1",
  forcePathStyle: true, // Necesario para S3 en LocalStack
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

    const command = new DeleteItemCommand({
      TableName: USERS_TABLE,
      Key: { userId: { S: userId } },
    });

    await ddbClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Usuario eliminado exitosamente" }),
    };
  } catch (error) {
    console.error("Error eliminando el usuario: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
