import dotenv from "dotenv"
dotenv.config()

import express from "express";
import cors from "cors";
import router from "./src/routes/router.js"

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : true,
  }),
);
app.use(router)

async function main() {

  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Backend escuchando en puerto ${process.env.SERVER_PORT}`);
  });

}

await main()

export default app