# HAMRadio QSL Verification Platform

Plataforma descentralizada para confirmar y verificar contactos entre operadores de radioaficionados (HAMRadio) utilizando blockchain de Cardano.

## 📡 ¿Qué es?

Un sistema digital que permite a los operadores de radio aficionada (HAM) subir confirmaciones de contacto (QSL - Quality Signal Letters) y verificarlas mutuamente de forma segura e inmutable utilizando la blockchain de Cardano.

En lugar de esperar semanas por tarjetas postales o usar plataformas centralizadas, los operadores pueden:
- Registrar contactos directamente en la plataforma
- Confirmar mutuamente los contactos
- Recibir un certificado digital (token/NFT) en Cardano como prueba
- Acceder a estadísticas de sus contactos verificados

## 🎯 Propuesta de Valor

| Antes | Después |
|-------|---------|
| QSLs por correo postal (2-4 semanas) | Confirmación instantánea en blockchain |
| Plataformas fragmentadas y manuales | Sistema centralizado y descentralizado |
| Sin verificación criptográfica | Tokens inmutables en Cardano |
| Datos atrapados en silos | Portabilidad total entre aplicaciones |

## 🛠️ Stack Tecnológico

- **Blockchain**: [Cardano](https://cardano.org/)
- **Smart Contracts**: [Aiken](https://aiken-lang.org/) (Plutus mejorado)
- **API Blockchain**: [Blockfrost](https://blockfrost.io/)
- **SDK Frontend**: [MeshJS](https://meshjs.dev/)
- **Frontend**: React/Vue (por definir)
- **Backend**: Node.js/Express (por definir)

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────┐
│         Frontend Web (React/Vue)                 │
│  - Subir info de contacto                       │
│  - Confirmar contactos                          │
│  - Ver estadísticas                             │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│    Backend API (Node.js/Express)                │
│  - Validación de datos                          │
│  - Gestión de usuarios                          │
│  - Cálculo de matching                          │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  MeshJS + Blockfrost (Integración Cardano)      │
│  - Firmar transacciones                         │
│  - Enviar tokens a la blockchain                │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  Smart Contract (Aiken)                         │
│  - Validar contactos                            │
│  - Emitir tokens/NFTs de QSL                    │
│  - Registrar en Cardano                         │
└─────────────────────────────────────────────────┘
```

## ✨ Características Principales

### MVP (Hackathon)
- ✅ Registro y login de operadores
- ✅ Subida de datos de contacto (frecuencia, hora, modo, call sign contrario)
- ✅ Búsqueda y matching automático de contactos
- ✅ Confirmación bilateral de contactos
- ✅ Emisión de token/NFT en Cardano como certificado
- ✅ Visualización de contactos confirmados
- ✅ Estadísticas básicas (contactos por país, frecuencia, etc.)

### Future Improvements
- Integración con bases de datos públicas de radioaficionados
- Sistema de reputación basado en confirmaciones
- Desafíos y eventos (ej: "contacta con 10 países en 24h")
- Marketplace de certificados digitales
- Aplicación móvil

## 📋 Flujo de Usuario

1. **Operador A** sube contacto: "Contacté con N0CALL a las 14:30 UTC en 40m"
2. **Sistema** busca coincidencias en la plataforma
3. **Operador B** recibe notificación de match potencial
4. **Operador B** confirma: "Sí, yo también contacté a esa hora en esa banda"
5. **Smart Contract** valida y emite token en Cardano
6. Ambos reciben certificado digital verificable en la blockchain

## 🚀 MVP Roadmap

| Fase | Tareas | Tiempo |
|------|--------|--------|
| 1 | Diseño de smart contract + base de datos | 4h |
| 2 | Backend API básico + autenticación | 4h |
| 3 | Frontend: formulario de contactos | 3h |
| 4 | Integración MeshJS + Blockfrost | 4h |
| 5 | Sistema de matching y confirmación | 3h |
| 6 | Pruebas y deploy | 2h |

## 💡 Valor Agregado para Cardano Ecosystem

- Caso de uso real en comunidad HAMRadio (global, 3M+ operadores)
- Demuestra uso de NFTs/Tokens para certificación digital
- Smart contracts simples pero funcionales
- Potencial de escala y monetización

## 📝 Datos de Contacto (QSL)

Cada QSL registrada incluye:
```json
{
  "operador_origen": "EA1ABC",
  "operador_destino": "W5XYZ",
  "frecuencia": "7.074 MHz",
  "modo": "SSB/CW/FT8",
  "hora_utc": "2025-11-05T14:30:00Z",
  "banda": "40m",
  "confirmado": false,
  "timestamp_blockchain": null,
  "token_id": null
}
```

## 🔗 Recursos

- [Cardano Documentation](https://developers.cardano.org/)
- [Aiken Language](https://aiken-lang.org/)
- [Blockfrost API](https://blockfrost.io/api/docs)
- [MeshJS Docs](https://meshjs.dev/)
- [IARU HAMRadio](https://www.iaru.org/)

---

**Para el Hackathon Aiken | Blockfrost | MeshJS**

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

### Ejecución
```bash
# Método recomendado
npm start

# Para desarrollo activo
npm run dev  # En una terminal
node dist/transaction.js  # En otra terminal después de cambios
```

### Estructura del Proyecto
```
src/
  transaction.ts    # Archivo principal con MeshWallet
  blockchain/       # Lógica de blockchain
  models/          # Modelos de datos
  services/        # Servicios de negocio
  utils/           # Utilidades
dist/              # JavaScript compilado
.env               # Variables de entorno (no versionar)
tsconfig.json      # Configuración TypeScript
```

### Funcionalidades Implementadas
- ✅ Configuración de MeshWallet para Cardano
- ✅ Generación de seeds con `MeshWallet.brew()`
- ✅ Carga de variables de entorno
- ✅ Compilación y ejecución TypeScript

### Próximos Pasos
1. Implementar creación de transacciones
2. Conectar con smart contracts
3. Desarrollar lógica de QSL matching
