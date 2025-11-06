# 🔐 Ejercicio Multisig 3-of-5 con Native Scripts

## 📋 Descripción General

Este ejercicio implementa un sistema multisig completo usando **Native Scripts de Cardano** que requiere **3 firmas de 5 wallets autorizadas** para gastar fondos. El proceso está dividido en scripts especializados que demuestran la creación, validación y gasto de UTXOs protegidos por multisig.

## 📁 Estructura de Archivos

```
0-generar-wallets.ts       # Generador de wallets para el .env

1-crear-multisig-utxo.ts   # Crear UTXO de 100 ADA con Native Script

2-testear.ts               # Testing de validación multisig (sin blockchain)

3-gastar-multisig-utxo.ts  # Gastar UTXO con 3 firmas y distribuir fondos

funciones.ts               # Funciones auxiliares (LoadWallet)

README.md                  # Este archivo
```

## 🚀 Flujo de Ejecución Completo

### Paso 0: Generar Wallets (Opcional)
```bash
npx ts-node src/ejercicio-a3-multisig/0-generar-wallets.ts
```

**¿Qué hace?**
- Genera 6 wallets nuevas con mnemonics de 24 palabras
- Muestra las direcciones y balances en testnet
- Proporciona configuración lista para el `.env`
- **Uso**: Solo si necesitas wallets nuevas para el ejercicio

### Paso 1: Crear UTXO Multisig
```bash
npx ts-node src/ejercicio-a3-multisig/1-crear-multisig-utxo.ts
```

**¿Qué hace?**
- ✅ Carga 5 wallets autorizadas desde `.env`
- ✅ Crea Native Script tipo "atLeast" (3-of-5)
- ✅ Genera dirección del script usando los public key hashes
- ✅ Envía 100 ADA desde wallet principal al script
- ✅ Guarda configuración del UTXO en variables de entorno
- ✅ Muestra hash de transacción y dirección del script

**Resultado**: UTXO de 100 ADA protegido por Native Script multisig

### Paso 2: Testing de Validación (Opcional)
```bash
npx ts-node src/ejercicio-a3-multisig/2-testear.ts
```

**¿Qué hace?**
- 🧪 Prueba la función `validateMultisigRequirements` sin blockchain
- 🧪 Ejecuta 6 escenarios de prueba diferentes:
  - ✅ **Caso 1**: 3 firmantes (válido)
  - ✅ **Caso 2**: 4 firmantes (válido) 
  - ✅ **Caso 3**: 5 firmantes (válido)
  - ❌ **Caso 4**: 0 firmantes (inválido)
  - ❌ **Caso 5**: 1 firmante (inválido)
  - ❌ **Caso 6**: 2 firmantes (inválido)
- 🧪 Verifica que la lógica "atLeast" funciona correctamente
- 🧪 Validación pura sin costos de blockchain

**Resultado**: Confirmación de que la validación funciona (3 válidos, 3 inválidos)

### Paso 3: Gastar UTXO Multisig
```bash
npx ts-node src/ejercicio-a3-multisig/3-gastar-multisig-utxo.ts
```

**¿Qué hace?**
- 💰 Lee configuración del UTXO desde `.env`
- 💰 Recrea el Native Script idéntico al original
- 💰 Selecciona 3 wallets para firmar (wallets 1, 2, 3)
- 💰 Construye transacción con el UTXO del script como input
- 💰 Distribuye fondos equitativamente entre los 3 firmantes
- 💰 Aplica las 3 firmas requeridas por el Native Script
- 💰 Envía la transacción a la blockchain

**Resultado**: 100 ADA distribuidos (~32.67 ADA por firmante)

## 🔧 Configuración Requerida

### Archivo `.env`
```env
# Configuración de Red
NETWORK_ID=0
BLOCKFROST_APIKEY="preprodK4WYIuB6h3QQOYHZSPbwsqOBO5C1mvAa"

# Wallet Principal (para crear UTXO)
WALLET_SEEDS=["blue","south","again",...] # 24 palabras

# Wallets Autorizadas del Multisig (5 wallets)
WALLET_SEEDS_1='["slender","wagon","useless",...] # 24 palabras
WALLET_SEEDS_2='["chat","fat","million",...] # 24 palabras  
WALLET_SEEDS_3='["wheel","monkey","obey",...] # 24 palabras
WALLET_SEEDS_4='["boring","visual","cement",...] # 24 palabras
WALLET_SEEDS_5='["palm","case","panel",...] # 24 palabras

# Configuración del UTXO Multisig (se genera automáticamente)
MULTISIG_UTXO_HASH="b5346398aa48248b9232619aa0bdb7424593c5664e2203c45142468553629474"
MULTISIG_UTXO_INDEX="0"
MULTISIG_SCRIPT_ADDRESS="addr_test1wp5m8s6f2p4yjscxzmwp5vnaz7lklazxus7tshf0m3jx2dgcejgfv"
MULTISIG_SCRIPT_CBOR="830303858200581c42a49561bcf8402e09663d3290023171777732ad06c0a19cb7b55a468200581c5733a3d4afe5ae13d73d5f93dd6805ee52756e4984df315dc0d2faad8200581cd078e503ba2531f74549d729898a13dc42fb062056b1b72391ff112d8200581c75b28e92e969b2b8f9a341857fc7174cc6d151ed0dfffd8e4e4daaa58200581c121043087f6c23c1a43d46c27f297522e9142d3ee025cb5c708a68db"
```

## 💡 Conceptos Técnicos Implementados

### Native Script Structure
```javascript
{
  type: "atLeast",      // Requiere AL MENOS n firmas
  required: 3,          // Mínimo 3 firmas requeridas
  scripts: [            // Lista de 5 wallets autorizadas
    { type: "sig", keyHash: "hash1" },
    { type: "sig", keyHash: "hash2" },
    { type: "sig", keyHash: "hash3" },
    { type: "sig", keyHash: "hash4" },
    { type: "sig", keyHash: "hash5" }
  ]
}
```

### Validación "AtLeast" 
- ✅ **3 firmas**: Válido (cumple el mínimo)
- ✅ **4 firmas**: Válido (supera el mínimo)
- ✅ **5 firmas**: Válido (todas las firmas)
- ❌ **0-2 firmas**: Inválido (no cumple el mínimo)

### Flujo de Transacción
1. **Input**: UTXO del script con 100 ADA
2. **Outputs**: 3 outputs de ~32.67 ADA cada uno
3. **Firmas**: 3 firmas parciales aplicadas secuencialmente
4. **Validación**: Native Script valida automáticamente en blockchain

## 🧪 Resultados de Ejecución

### Ejemplo de Ejecución Exitosa
```
Gastando UTXO multisig con Native Script...
UTXO objetivo: b5346398aa48248b9232...#0
Script Address: addr_test1wp5m8s6f2p4yjscxzmwp...
Cantidad esperada: 100 ADA
Wallets autorizadas cargadas: 5
Firmantes seleccionados para el multisig 3-of-5:
  Firmante 1: addr_test1qpp2f9tphnuyqtsfvc7n...
  Firmante 2: addr_test1qptn8g754lj6uy7h840e...
  Firmante 3: addr_test1qrg83egrhgjnra69f8tj...

✅ UTXO objetivo configurado para gastar desde el script
Distribuyendo 98 ADA entre 3 firmantes
32.666666 ADA cada uno (+2 lovelace al primero)
Transacción construida
Aplicando firmas multisig requeridas por el Native Script...
✅ 3 firmas aplicadas exitosamente

Transacción enviada: 419cbc5e438bdea386205ae64e186243c011241e16281264c1f439a668154939
Fondos liberados del Native Script y distribuidos exitosamente

============================================================
📊 RESUMEN DE LA OPERACIÓN MULTISIG CON NATIVE SCRIPT
============================================================
✅ Script utilizado: Native Script 3-of-5
✅ Dirección del script: addr_test1wp5m8s6f2p4yjscxzmwp5vnaz7lkla...
✅ UTXO gastado: b5346398aa48248b9232...#0
✅ Firmantes utilizados: 3
✅ Distribución: 32.666666 ADA por firmante
✅ TxHash: 419cbc5e438bdea386205ae64e186243c011241e16281264c1f439a668154939
✅ Los fondos fueron validados por la blockchain usando Native Script
============================================================
```

## 🔍 Diagrama de Flujo Completo

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 0-generar       │    │ 1-crear         │    │ 2-testear       │    │ 3-gastar        │
│ wallets         │───▶│ multisig-utxo   │───▶│ (opcional)      │───▶│ multisig-utxo   │
│ (opcional)      │    │                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 6 wallets       │    │ UTXO creado     │    │ Validación      │    │ Fondos          │
│ generadas       │    │ 100 ADA         │    │ confirmada      │    │ distribuidos    │
│                 │    │ en script       │    │ (3 válidos)     │    │ 32.67 ADA c/u   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Objetivos Educativos

- **Native Scripts**: Entender cómo funcionan sin Plutus
- **Multisig**: Implementar esquemas de firmas múltiples 
- **Public Key Hashes**: Gestión de identidades en scripts
- **UTXO Management**: Crear y consumir UTXOs específicos
- **Transaction Building**: Construcción de transacciones complejas
- **Partial Signing**: Aplicación de múltiples firmas secuenciales
- **Error Handling**: Gestión de errores comunes en blockchain

## 📚 Dependencias

- **@meshsdk/core**: SDK principal para Cardano
- **dotenv**: Gestión de variables de entorno
- **TypeScript**: Tipado estático y compilación
- **ts-node**: Ejecución directa de TypeScript