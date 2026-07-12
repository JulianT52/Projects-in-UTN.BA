# AI Do It - Frontend Expo

Este frontend fue migrado de React Native CLI a Expo para poder correrlo sin compilar Android nativo.

## Correr en web con estilo celular

Desde la carpeta `backend`:

```bash
npm install
npm start
```

Desde la carpeta `frontend`:

```bash
npm install
npm run web
```

Se abre en el navegador. La app queda centrada con ancho de celular.

## Correr en Expo Go desde un celular

1. Instalá Expo Go en el celular.
2. En `frontend`, creá un archivo `.env` con la IP de tu PC:

```txt
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.25:3000
```

Reemplazá `192.168.0.25` por la IP real de tu computadora.

3. Corré:

```bash
npm start
```

4. Escaneá el QR con Expo Go.

## Importante

No reinicies el backend durante la demo. Los datos se guardan en memoria, por eso si apagás el backend se pierden usuarios, gigs, pedidos y mensajes.
