export function getErrorMessage(err, fallback = "Ocurrió un error inesperado.") {
  if (!err?.response) {
    return "No se pudo conectar con el backend. Verifica que esté corriendo.";
  }
  const { status, data } = err.response;
  if (data?.detail) return data.detail;
  switch (status) {
    case 401:
      return "Tu sesión expiró. Vuelve a iniciar sesión.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "No se encontró el recurso solicitado.";
    case 413:
      return "El archivo es demasiado grande.";
    case 500:
      return "Error interno del servidor. Intenta de nuevo en unos segundos.";
    default:
      return fallback;
  }
}
