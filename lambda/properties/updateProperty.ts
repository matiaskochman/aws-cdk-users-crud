/**
 * Archivo: lambda/updateProperty.ts
 * Descripción: Actualiza (reemplaza) una propiedad en la tabla Properties de DynamoDB.
 * Se utiliza un reemplazo completo mediante PutItemCommand.
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
    const idParam = event.pathParameters?.id;
    if (!idParam) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "El parámetro id es obligatorio" }),
      };
    }
    const id = Number(idParam);
    if (isNaN(id)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "El id debe ser un número" }),
      };
    }
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Se requiere el body de la petición" }),
      };
    }

    const data: Property = JSON.parse(event.body);
    // Si se provee un id en el body, debe coincidir con el de la URL.
    if (data.id && Number(data.id) !== id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "El id del body debe coincidir con el id de la URL",
        }),
      };
    }
    // Forzar el id a coincidir con el de la URL
    data.id = id;

    data.fechaPublicacion = new Date(data.fechaPublicacion).toISOString();

    const item = marshall(data, { removeUndefinedValues: true });

    const command = new PutItemCommand({
      TableName: PROPERTIES_TABLE,
      Item: item,
    });
    await ddbClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error actualizando la propiedad: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
