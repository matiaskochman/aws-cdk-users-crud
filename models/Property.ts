export interface Property {
  id: number;
  titulo: string;
  ubicacion: {
    direccion: string;
    ciudad: string;
    provincia: string;
    pais: string;
  };
  precio: {
    monto: number;
    moneda: "USD" | "ARS" | "EUR"; // Se pueden agregar más monedas
    periodo: "mensual" | "anual" | "semanal"; // Se pueden agregar más periodos
  };
  tipo: "departamento" | "casa" | "ph" | "terreno"; // Otros tipos de propiedades
  ambientes: number;
  dormitorios: number;
  banos: number;
  superficie: {
    total: number; // en m²
    cubierta: number; // en m²
  };
  amueblado: boolean;
  servicios: string[];
  amenities: string[];
  ocupaciones: [string, string][]; // Rango de fechas ocupadas ["dd-mm-yyyy", "dd-mm-yyyy"]
  fechasNoDisponibles: string[]; // Fechas específicas no disponibles ["dd-mm-yyyy"]
  contacto: {
    nombre: string;
    telefono: string;
    email: string;
  };
  imagenes: string[];
  fechaPublicacion: string; // Formato ISO8601 ("YYYY-MM-DDTHH:MM:SSZ")
  descripcion: string;
}
