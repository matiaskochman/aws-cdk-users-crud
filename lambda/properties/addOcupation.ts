import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({});
const PROPERTIES_TABLE = process.env.PROPERTIES_TABLE_NAME || "";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Se espera que el id de la propiedad venga en los path parameters.
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

    // Se espera que el body tenga los campos startDate y endDate (formato "dd-mm-yyyy")
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Se requiere el body de la petición" }),
      };
    }
    const { startDate, endDate } = JSON.parse(event.body);
    if (!startDate || !endDate) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Se requieren startDate y endDate" }),
      };
    }

    // Se construye el comando para actualizar el atributo "ocupaciones".
    // Usamos list_append para agregar el nuevo rango y if_not_exists por si la propiedad aún no tiene ocupaciones.
    const command = new UpdateItemCommand({
      TableName: PROPERTIES_TABLE,
      Key: {
        id: { N: id.toString() },
      },
      UpdateExpression:
        "SET ocupaciones = list_append(if_not_exists(ocupaciones, :empty_list), :newOccupation)",
      ExpressionAttributeValues: {
        ":newOccupation": { L: [{ L: [{ S: startDate }, { S: endDate }] }] },
        ":empty_list": { L: [] },
      },
      ReturnValues: "ALL_NEW",
    });

    const response = await ddbClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Ocupación agregada exitosamente",
        property: response.Attributes,
      }),
    };
  } catch (error) {
    console.error("Error agregando la ocupación: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
