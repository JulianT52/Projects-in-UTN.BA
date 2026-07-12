import { Providers } from "./providers";
import Header from "../components/header/Header";
import "../index.css";
import "../App.css";

export const metadata = {
  title: "Sweet Medical",
  description: "Plataforma de gestión de turnos médicos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>
            <Header/>
            {children}
          </Providers>
      </body>
    </html>
  );
}