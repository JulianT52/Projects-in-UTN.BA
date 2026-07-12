import dotenv from "dotenv"
dotenv.config()

import mongoose from "mongoose";
import app from "./src/app.js";
import { iniciarCronTurnos } from "./src/jobs/GeneradorTurnosJob.js";
import { iniciarCronRecordatorios } from "./src/jobs/RecordatoriosJob.js";

main().catch(err => console.log(err));

async function main() {

  await mongoose.connect(process.env.MONGO_URI);
  console.log("¡Conectado a MongoDB con éxito!");

  iniciarCronTurnos();
  iniciarCronRecordatorios();

  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Backend escuchando en puerto ${process.env.SERVER_PORT}`);
  });

}

export default app
