/**
 * Archivo: lambda/listProperties.ts
 * Descripción: Lista todas las propiedades de la tabla Properties en DynamoDB.
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
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
    const command = new ScanCommand({
      TableName: PROPERTIES_TABLE,
    });
    const response = await ddbClient.send(command);
    const properties =
      response.Items?.map((item) => unmarshall(item) as Property) || [];

    return {
      statusCode: 200,
      body: JSON.stringify(properties),
    };
  } catch (error) {
    console.error("Error listando propiedades: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
