describe("Búsqueda de turnos", () => {
  it("muestra resultados al buscar", () => {
    cy.intercept("GET", "**/especialidades*", { data: [] }).as("especialidades");
    cy.intercept("GET", "**/sede*", { data: [] }).as("sedes");
    cy.intercept("GET", "**/turnos/disponibles*", { fixture: "turnos.json" }).as("buscar");

    cy.visit("/paciente/buscarTurnos", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "usuario",
          JSON.stringify({ pacienteId: "paciente-1" }),
        );
      },
    });

    cy.contains("Buscar").click();
    cy.wait("@buscar");
    cy.get(".resultados, .turno-card").should("exist");
  });
});
