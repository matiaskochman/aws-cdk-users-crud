/**
 * Archivo: lambda/createUser.ts
 * Descripción: Crea un usuario en DynamoDB
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({});
const USERS_TABLE = process.env.USERS_TABLE_NAME || "";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Se requiere el body de la petición" }),
      };
    }
    const data = JSON.parse(event.body);
    const { userId, email, name } = data;
    if (!userId || !email || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Faltan campos obligatorios: userId, email, name",
        }),
      };
    }

    const createdAt = new Date().toISOString();

    const command = new PutItemCommand({
      TableName: USERS_TABLE,
      Item: {
        userId: { S: userId },
        email: { S: email },
        name: { S: name },
        createdAt: { S: createdAt },
      },
    });

    await ddbClient.send(command);

    return {
      statusCode: 201,
      body: JSON.stringify({ userId, email, name, createdAt }),
    };
  } catch (error) {
    console.error("Error creando el usuario: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
