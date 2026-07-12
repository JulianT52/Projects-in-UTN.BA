export const normalizarRol = (rol) => {
  if (typeof rol !== "string") return "";
  return rol.trim().toUpperCase();
};

export const esRolMedico = (rol) => normalizarRol(rol) === "MEDICO";

export const esRolPaciente = (rol) => normalizarRol(rol) === "PACIENTE";

export const obtenerRutaPorRol = (usuario) => {
  const rol = usuario?.rol ?? usuario?.role;

  if (esRolMedico(rol)) return "/medico";
  if (esRolPaciente(rol)) return "/paciente";
  return "/";
};
