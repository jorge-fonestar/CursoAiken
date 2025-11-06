# 🔐 Scripts Multisig Simplificados

## 📋 Descripción

Dos scripts simples para implementar multisig 3-of-5:

1. **`create-multisig-utxo.ts`** - Crea un UTXO con 100 ADA
2. **`spend-multisig-utxo.ts`** - Gasta el UTXO con 3 firmas de 5

## 🚀 Uso

### Paso 1: Crear UTXO con 100 ADA

```bash
npx ts-node src/ejercicio-a3-multisig/create-multisig-utxo.ts
```

**El script mostrará:**
```
📋 INFORMACIÓN PARA EL .ENV
==================================================
Agrega estas líneas a tu archivo .env:

MULTISIG_UTXO_HASH="abc123def456..."
MULTISIG_UTXO_INDEX="0"
==================================================
```

### Paso 2: Actualizar .env

Agrega las líneas mostradas a tu archivo `.env`:

```env
# Configuración existente
BLOCKFROST_APIKEY="preprodXXXXXXXXXXXXXX"
NETWORK_ID="0"
WALLET_SEEDS_1='["word1", ...]'
# ... resto de wallets ...

# Nueva configuración del UTXO multisig
MULTISIG_UTXO_HASH="abc123def456..."
MULTISIG_UTXO_INDEX="0"
```

### Paso 3: Gastar UTXO con multisig

```bash
npx ts-node src/ejercicio-a3-multisig/spend-multisig-utxo.ts
```

**Qué hace:**
- Lee el UTXO específico desde .env
- Verifica que existe y tiene la cantidad correcta
- Usa wallets 1, 2, 3 para firmar
- Distribuye ~32.67 ADA a cada firmante
- Envía el cambio a la wallet original
- Usa 3 wallets para firmar (wallets 1, 2, 3)
- Distribuye fondos: ~32.67 ADA a cada una
- Envía el cambio a la wallet original

## 🔧 Requisitos

**Archivo `.env` configurado:**
```env
BLOCKFROST_APIKEY="preprodXXXXXXXXXXXXXX"
NETWORK_ID="0"

WALLET_SEEDS_1='["word1", "word2", ..., "word24"]'
WALLET_SEEDS_2='["word1", "word2", ..., "word24"]'
WALLET_SEEDS_3='["word1", "word2", ..., "word24"]'
WALLET_SEEDS_4='["word1", "word2", ..., "word24"]'
WALLET_SEEDS_5='["word1", "word2", ..., "word24"]'
```

## 💡 Conceptos Implementados

- **Native Script**: Validación sin Plutus
- **Multisig 3-of-5**: Requiere 3 firmas de 5 wallets
- **Distribución de fondos**: División equitativa entre firmantes
- **Gestión de cambio**: Fondos restantes a wallet original

## 🧪 Flujo de Ejecución

```
┌─────────────────┐    ┌─────────────────┐
│ Script 1        │    │ Script 2        │
│ Crear UTXO      │───▶│ Gastar UTXO     │
│ 100 ADA         │    │ 3 firmas        │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ UTXO creado     │    │ Fondos          │
│ en wallet 1     │    │ distribuidos    │
└─────────────────┘    └─────────────────┘
```