/**
 * Archivo: lambda/getProperty.ts
 * Descripción: Obtiene una propiedad por id desde la tabla Properties en DynamoDB.
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
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

    const command = new GetItemCommand({
      TableName: PROPERTIES_TABLE,
      Key: {
        id: { N: id.toString() },
      },
    });

    const response = await ddbClient.send(command);
    if (!response.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Propiedad no encontrada" }),
      };
    }

    const property = unmarshall(response.Item) as Property;
    return {
      statusCode: 200,
      body: JSON.stringify(property),
    };
  } catch (error) {
    console.error("Error obteniendo la propiedad: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
