

#!/bin/bash
echo "Iniciando LocalStack..."

# Función para verificar si una tabla de DynamoDB existe
table_exists() {
  aws dynamodb describe-table --table-name "$1" --endpoint-url http://localhost:4566 > /dev/null 2>&1
}

# Crear la tabla de usuarios si no existe
if ! table_exists "Users"; then
  aws dynamodb create-table --table-name Users \
    --attribute-definitions AttributeName=userId,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost:4566
  echo "Tabla 'Users' creada."
else
  echo "Tabla 'Users' ya existe."
fi

# Crear la tabla de propiedades si no existe
if ! table_exists "Properties"; then
  aws dynamodb create-table --table-name Properties \
    --attribute-definitions AttributeName=id,AttributeType=N \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost:4566
  echo "Tabla 'Properties' creada."
else
  echo "Tabla 'Properties' ya existe."
fi

# Verificar si el bucket S3 ya existe antes de crearlo
if ! aws s3 ls --endpoint-url http://localhost:4566 | grep -q "user-uploads-cdk-v1"; then
  aws s3 mb s3://user-uploads-cdk-v1 --endpoint-url http://localhost:4566
  echo "Bucket 'user-uploads-cdk-v1' creado."
else
  echo "Bucket 'user-uploads-cdk-v1' ya existe."
fi

echo "LocalStack inicializado!"
