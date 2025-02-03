/**
 * Archivo: lambda/generateUploadUrl.ts
 * Descripción: Genera una URL firmada para cargar archivos en S3
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.BUCKET_NAME || "";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body || "{}");
    const { fileName, fileType } = data;
    if (!fileName || !fileType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Se requieren fileName y fileType" }),
      };
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    });

    // URL firmada válida por 5 minutos (300 segundos)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: signedUrl }),
    };
  } catch (error) {
    console.error("Error generando la URL firmada: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
