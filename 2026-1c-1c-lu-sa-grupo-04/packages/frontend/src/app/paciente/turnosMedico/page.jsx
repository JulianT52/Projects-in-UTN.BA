import { Suspense } from "react";
import TurnosMedico from "../../../components/turnosMedico/TurnosMedico";

export default function TurnosMedicoPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <TurnosMedico />
      </Suspense>
    </main>
  );
}
