#!/bin/bash

API_URL="https://msipz3cokx.execute-api.localhost.localstack.cloud:4566/prod"

echo "=== Crear usuario ==="
curl -X POST "$API_URL/users" \
     -H "Content-Type: application/json" \
     -d '{
           "userId": "user-001",
           "email": "user001@example.com",
           "name": "Alice"
         }'
echo

echo "=== Listar usuarios ==="
curl -X GET "$API_URL/users"
echo

echo "=== Crear propiedad ==="
curl -X POST "$API_URL/properties" \
     -H "Content-Type: application/json" \
     -d '{
           "id": 1,
           "titulo": "Departamento en Palermo",
           "ubicacion": {
             "direccion": "Av. Santa Fe 3400",
             "ciudad": "Buenos Aires",
             "provincia": "Buenos Aires",
             "pais": "Argentina"
           },
           "precio": {
             "monto": 800,
             "moneda": "USD",
             "periodo": "mensual"
           },
           "tipo": "departamento",
           "ambientes": 3,
           "dormitorios": 2,
           "banos": 1,
           "superficie": {
             "total": 80,
             "cubierta": 70
           },
           "amueblado": true,
           "servicios": ["wifi", "agua", "electricidad", "gas"],
           "amenities": ["pileta", "gimnasio", "terraza", "seguridad 24hs"],
           "ocupaciones": [["01-01-2025", "15-01-2025"]],
           "fechasNoDisponibles": ["25-12-2024"],
           "contacto": {
             "nombre": "Juan Pérez",
             "telefono": "+54 11 1234-5678",
             "email": "juanperez@example.com"
           },
           "imagenes": [
             "https://misimagenes.com/img1.jpg",
             "https://misimagenes.com/img2.jpg"
           ],
           "fechaPublicacion": "2024-02-03T12:00:00Z",
           "descripcion": "Departamento moderno en Palermo..."
         }'
echo

echo "=== Listar propiedades ==="
curl -X GET "$API_URL/properties"
echo

echo "=== Agregar ocupación a la propiedad con id=1 ==="
curl -X POST "$API_URL/properties/1/occupy" \
     -H "Content-Type: application/json" \
     -d '{
           "startDate": "10-02-2025",
           "endDate": "20-02-2025"
         }'
echo

echo "=== Obtener la propiedad con id=1 ==="
curl -X GET "$API_URL/properties/1"
echo
