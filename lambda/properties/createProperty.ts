/**
 * Archivo: lambda/createProperty.ts
 * Descripción: Crea una propiedad en la tabla Properties de DynamoDB.
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { Property } from "../../models/Property";
const isLocal = process.env.USE_LOCALSTACK === "true";

const ddbClient = new DynamoDBClient({
  endpoint: isLocal ? "http://localhost:4566" : undefined,
  region: "us-east-1",
  credentials: isLocal
    ? { accessKeyId: "test", secretAccessKey: "test" }
    : undefined,
});

const PROPERTIES_TABLE = process.env.PROPERTIES_TABLE_NAME || "";

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
    // Parseamos el body y lo tipamos como Property
    const data: Property = JSON.parse(event.body);

    // Validación mínima: se requiere id y título
    if (data.id === undefined || !data.titulo) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Se requieren los campos 'id' y 'titulo'",
        }),
      };
    }

    // Convertir fechaPublicacion a formato ISO8601
    data.fechaPublicacion = new Date(data.fechaPublicacion).toISOString();

    const item = marshall(data, { removeUndefinedValues: true });

    const command = new PutItemCommand({
      TableName: PROPERTIES_TABLE,
      Item: item,
    });
    await ddbClient.send(command);

    return {
      statusCode: 201,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error creando la propiedad: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
