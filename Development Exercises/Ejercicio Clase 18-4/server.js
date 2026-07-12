import app from "./apps.js"
import dotenv from "dotenv"
dotenv.config()

// Accedo al puerto
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log("Servidor inicializado en http://localhost:3000")
})