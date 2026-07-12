import { Suspense } from "react";
import BuscarTurnos from "../../components/buscarTurnos/buscarTurnos.jsx";

export default function BuscarTurnosPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <BuscarTurnos />
      </Suspense>
    </main>
  );
}
