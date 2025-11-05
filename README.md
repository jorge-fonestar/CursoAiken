# Curso de AIKEN con Robertino Nov/2025

### Ejecución
```bash
# Método recomendado
npm start

# Para ejecutar un script concreto
npx ts-node src/transaction.ts

# Para desarrollo activo
npm run dev  # En una terminal
node dist/transaction.js  # En otra terminal después de cambios
```

## 🔗 Recursos

- [Cardano Documentation](https://developers.cardano.org/)
- [Aiken Language](https://aiken-lang.org/)
- [Blockfrost API](https://blockfrost.io/api/docs)
- [MeshJS Docs](https://meshjs.dev/)
- [IARU HAMRadio](https://www.iaru.org/)

---


## 🔧 Configuración y Desarrollo

### Requisitos
- Node.js v25+ 
- TypeScript
- Variables de entorno configuradas

### Instalación
```bash
npm install
```

### Configuración
Crear archivo `.env` con:
```env
BLOCKFROST_API_KEY="tu_api_key_aqui"
WALLET_SEEDS="['word1', 'word2', ..., 'word24']"
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Compila y ejecuta el proyecto |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm run dev` | Compila en modo watch (recompila automáticamente) |
| `npm run clean` | Limpia la carpeta dist |
| `npm run build:run` | Compila y ejecuta |


