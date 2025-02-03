API_URL="https://ap3xzldn0c.execute-api.us-east-1.amazonaws.com/prod/properties"


curl -X POST "$API_URL" \
     -H "Content-Type: application/json" \
     -d '{
          "id": 1,
          "titulo": "Departamento en Palermo, Buenos Aires",
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
            "https://ejemplo.com/departamento-palermo1.jpg",
            "https://ejemplo.com/departamento-palermo2.jpg"
          ],
          "fechaPublicacion": "2024-02-03T12:00:00Z",
          "descripcion": "Departamento moderno en el corazón de Palermo, ideal para familias o parejas."
        }'


curl -X POST "$API_URL" \
     -H "Content-Type: application/json" \
     -d '{
          "id": 2,
          "titulo": "Casa en Nordelta con jardín y pileta",
          "ubicacion": {
            "direccion": "Calle Los Álamos 123",
            "ciudad": "Tigre",
            "provincia": "Buenos Aires",
            "pais": "Argentina"
          },
          "precio": {
            "monto": 2500,
            "moneda": "USD",
            "periodo": "mensual"
          },
          "tipo": "casa",
          "ambientes": 5,
          "dormitorios": 4,
          "banos": 3,
          "superficie": {
            "total": 300,
            "cubierta": 250
          },
          "amueblado": false,
          "servicios": ["wifi", "agua", "electricidad", "gas", "seguridad"],
          "amenities": ["pileta", "quincho", "cochera doble"],
          "ocupaciones": [],
          "fechasNoDisponibles": ["01-05-2025"],
          "contacto": {
            "nombre": "María Rodríguez",
            "telefono": "+54 11 9876-5432",
            "email": "maria.rodriguez@example.com"
          },
          "imagenes": [
            "https://ejemplo.com/casa-nordelta1.jpg",
            "https://ejemplo.com/casa-nordelta2.jpg"
          ],
          "fechaPublicacion": "2024-02-05T15:00:00Z",
          "descripcion": "Hermosa casa en barrio privado, con vista al lago y excelente seguridad."
        }'


curl -X POST "$API_URL" \
     -H "Content-Type: application/json" \
     -d '{
          "id": 3,
          "titulo": "PH en San Telmo con terraza propia",
          "ubicacion": {
            "direccion": "Defensa 750",
            "ciudad": "Buenos Aires",
            "provincia": "Buenos Aires",
            "pais": "Argentina"
          },
          "precio": {
            "monto": 1200,
            "moneda": "USD",
            "periodo": "mensual"
          },
          "tipo": "ph",
          "ambientes": 4,
          "dormitorios": 2,
          "banos": 2,
          "superficie": {
            "total": 150,
            "cubierta": 100
          },
          "amueblado": true,
          "servicios": ["wifi", "agua", "electricidad", "gas"],
          "amenities": ["terraza", "parrilla"],
          "ocupaciones": [["05-06-2025", "20-06-2025"]],
          "fechasNoDisponibles": [],
          "contacto": {
            "nombre": "Carlos López",
            "telefono": "+54 11 3333-5555",
            "email": "carlos.lopez@example.com"
          },
          "imagenes": [
            "https://ejemplo.com/ph-santelmo1.jpg",
            "https://ejemplo.com/ph-santelmo2.jpg"
          ],
          "fechaPublicacion": "2024-02-06T18:00:00Z",
          "descripcion": "PH con detalles únicos, techos altos y una increíble terraza en el corazón de San Telmo."
        }'


curl -X POST "$API_URL" \
     -H "Content-Type: application/json" \
     -d '{
          "id": 4,
          "titulo": "Terreno en Bariloche con vista al lago",
          "ubicacion": {
            "direccion": "Ruta 40 km 2040",
            "ciudad": "San Carlos de Bariloche",
            "provincia": "Río Negro",
            "pais": "Argentina"
          },
          "precio": {
            "monto": 100000,
            "moneda": "USD",
            "periodo": "único"
          },
          "tipo": "terreno",
          "ambientes": 0,
          "dormitorios": 0,
          "banos": 0,
          "superficie": {
            "total": 5000,
            "cubierta": 0
          },
          "amueblado": false,
          "servicios": ["electricidad", "agua"],
          "amenities": [],
          "ocupaciones": [],
          "fechasNoDisponibles": [],
          "contacto": {
            "nombre": "Luciana Gómez",
            "telefono": "+54 294 456-7890",
            "email": "luciana.gomez@example.com"
          },
          "imagenes": [
            "https://ejemplo.com/terreno-bariloche1.jpg",
            "https://ejemplo.com/terreno-bariloche2.jpg"
          ],
          "fechaPublicacion": "2024-02-07T09:30:00Z",
          "descripcion": "Terreno amplio con vista panorámica al lago Nahuel Huapi, ideal para construir cabañas."
        }'


curl -X POST "$API_URL" \
     -H "Content-Type: application/json" \
     -d '{
          "id": 5,
          "titulo": "Loft en Puerto Madero con vista al río",
          "ubicacion": {
            "direccion": "Av. Alicia Moreau de Justo 2000",
            "ciudad": "Buenos Aires",
            "provincia": "Buenos Aires",
            "pais": "Argentina"
          },
          "precio": {
            "monto": 3000,
            "moneda": "USD",
            "periodo": "mensual"
          },
          "tipo": "departamento",
          "ambientes": 2,
          "dormitorios": 1,
          "banos": 1,
          "superficie": {
            "total": 90,
            "cubierta": 85
          },
          "amueblado": true,
          "servicios": ["wifi", "agua", "electricidad", "gas"],
          "amenities": ["gimnasio", "pileta", "seguridad 24hs"],
          "ocupaciones": [],
          "fechasNoDisponibles": [],
          "contacto": {
            "nombre": "Federico Ramírez",
            "telefono": "+54 11 7777-8888",
            "email": "federico.ramirez@example.com"
          },
          "imagenes": [
            "https://ejemplo.com/loft-pm1.jpg",
            "https://ejemplo.com/loft-pm2.jpg"
          ],
          "fechaPublicacion": "2024-02-07T14:00:00Z",
          "descripcion": "Exclusivo loft con gran diseño y vistas espectaculares al río."
        }'
