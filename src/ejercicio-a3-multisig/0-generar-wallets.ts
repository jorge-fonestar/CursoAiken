console.log("=== GENERADOR DE WALLETS PARA MULTISIG 3-of-5 ===");

import { MeshWallet } from "@meshsdk/core";

/**
 * Script para generar 5 semillas de wallets para usar en el multisig
 * Ejecutar con: npx ts-node src/ejercicio-a3-multisig/generate-wallets.ts
 */

console.log("\n🔑 Generando 5 semillas de wallets para multisig...\n");

// Generar 5 wallets
for (let i = 1; i <= 5; i++) {
    const seed = MeshWallet.brew() as string[];
    
    console.log(`# WALLET ${i} - Firmante Autorizado #${i}`);
    console.log(`WALLET_SEEDS_${i}='${JSON.stringify(seed)}'`);
    console.log("");
}

console.log("=".repeat(60));
console.log("✅ SEMILLAS GENERADAS EXITOSAMENTE");
console.log("=".repeat(60));
console.log("📋 INSTRUCCIONES:");
console.log("1. Copia las líneas de arriba a tu archivo .env");
console.log("2. Asegúrate de configurar también BLOCKFROST_APIKEY");
console.log("3. Configura NETWORK_ID='0' para testnet");
console.log("4. Ejecuta el ejercicio multisig: npx ts-node src/ejercicio-a3-multisig/ejercicio-3.ts");
console.log("\n⚠️  IMPORTANTE: Guarda estas semillas de forma segura!");
console.log("   Estas semillas controlan las wallets autorizadas del multisig");