export function formatearTiempo(fechaISO) {
  const ahora = new Date();
  const fecha = new Date(fechaISO);
  const diffMs = ahora - fecha;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffMin < 1) return "Justo ahora";
  if (diffMin < 60) return `Hace ${diffMin} minuto${diffMin > 1 ? "s" : ""}`;
  if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;
  if (diffDias < 30) return `Hace ${diffDias} día${diffDias > 1 ? "s" : ""}`;
  return fecha.toLocaleDateString("es-AR");
}