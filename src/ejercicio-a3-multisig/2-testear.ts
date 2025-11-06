import { 
    BlockfrostProvider, 
    MeshWallet
} from "@meshsdk/core"
import dotenv from "dotenv"
dotenv.config()

/**
 * 🧪 SCRIPT DE PRUEBAS MULTISIG
 * Demuestra diferentes escenarios de validación sin realizar transacciones reales
 */

// Importar la función de validación
function validateMultisigRequirements(
    authorizedAddresses: string[],
    signingAddresses: string[],
    requiredSignatures: number = 3,
    totalAuthorized: number = 5
): { isValid: boolean; message: string } {
    
    if (authorizedAddresses.length !== totalAuthorized) {
        return {
            isValid: false,
            message: `Se esperaban ${totalAuthorized} wallets autorizadas, se encontraron ${authorizedAddresses.length}`
        };
    }
    
    if (signingAddresses.length !== requiredSignatures) {
        return {
            isValid: false,
            message: `Multisig ${requiredSignatures}-of-${totalAuthorized} requiere exactamente ${requiredSignatures} firmas. Proporcionadas: ${signingAddresses.length}`
        };
    }
    
    const uniqueSigners = new Set(signingAddresses);
    if (uniqueSigners.size !== signingAddresses.length) {
        return {
            isValid: false,
            message: "Se detectaron firmantes duplicados. Cada wallet solo puede firmar una vez"
        };
    }
    
    const unauthorizedSigners = signingAddresses.filter(signerAddr => 
        !authorizedAddresses.includes(signerAddr)
    );
    
    if (unauthorizedSigners.length > 0) {
        return {
            isValid: false,
            message: `Firmantes no autorizados detectados: ${unauthorizedSigners.length} de ${signingAddresses.length}`
        };
    }
    
    return {
        isValid: true,
        message: `Validación exitosa: ${requiredSignatures} firmantes únicos y autorizados de ${totalAuthorized} posibles`
    };
}

async function runMultisigTests() {
    console.log("🧪 EJECUTANDO PRUEBAS DE VALIDACIÓN MULTISIG");
    console.log("=".repeat(60));
    
    // Cargar wallets desde .env
    const provider = new BlockfrostProvider(process.env.BLOCKFROST_APIKEY || "");
    const wallets: MeshWallet[] = [];
    
    for (let i = 1; i <= 5; i++) {
        const seedEnv = process.env[`WALLET_SEEDS_${i}`];
        if (!seedEnv) {
            console.log(`⚠️  WALLET_SEEDS_${i} no encontrada, saltando pruebas`);
            return;
        }
        
        const seed = JSON.parse(seedEnv) as string[];
        const wallet = new MeshWallet({
            networkId: parseInt(process.env.NETWORK_ID || "0") as 0 | 1,
            fetcher: provider,
            submitter: provider,
            key: { type: "mnemonic", words: seed }
        });
        
        wallets.push(wallet);
    }
    
    // Obtener direcciones
    const authorizedAddresses = await Promise.all(wallets.map(w => w.getChangeAddress()));
    
    console.log("📋 Wallets autorizadas cargadas:");
    authorizedAddresses.forEach((addr, i) => {
        console.log(`  ${i + 1}. ${addr.slice(0, 30)}...`);
    });
    
    console.log("\n" + "=".repeat(50));
    console.log("🧪 ESCENARIOS DE PRUEBA");
    console.log("=".repeat(50));
    
    // ESCENARIO 1: Configuración válida (3 de 5)
    console.log("\n📋 ESCENARIO 1: Configuración válida (3 firmantes autorizados)");
    const validSigners = [authorizedAddresses[0], authorizedAddresses[1], authorizedAddresses[2]];
    const result1 = validateMultisigRequirements(authorizedAddresses, validSigners);
    console.log(`   Resultado: ${result1.isValid ? '✅' : '❌'} ${result1.message}`);
    
    // ESCENARIO 2: Firmas insuficientes (2 de 5)
    console.log("\n📋 ESCENARIO 2: Firmas insuficientes (2 firmantes)");
    const insufficientSigners = [authorizedAddresses[0], authorizedAddresses[1]];
    const result2 = validateMultisigRequirements(authorizedAddresses, insufficientSigners);
    console.log(`   Resultado: ${result2.isValid ? '✅' : '❌'} ${result2.message}`);
    
    // ESCENARIO 3: Firmas excesivas (4 de 5)
    console.log("\n📋 ESCENARIO 3: Firmas excesivas (4 firmantes)");
    const excessiveSigners = [authorizedAddresses[0], authorizedAddresses[1], authorizedAddresses[2], authorizedAddresses[3]];
    const result3 = validateMultisigRequirements(authorizedAddresses, excessiveSigners);
    console.log(`   Resultado: ${result3.isValid ? '✅' : '❌'} ${result3.message}`);
    
    // ESCENARIO 4: Firmantes duplicados
    console.log("\n📋 ESCENARIO 4: Firmantes duplicados");
    const duplicateSigners = [authorizedAddresses[0], authorizedAddresses[1], authorizedAddresses[0]]; // Wallet 1 repetida
    const result4 = validateMultisigRequirements(authorizedAddresses, duplicateSigners);
    console.log(`   Resultado: ${result4.isValid ? '✅' : '❌'} ${result4.message}`);
    
    // ESCENARIO 5: Firmante no autorizado
    console.log("\n📋 ESCENARIO 5: Firmante no autorizado");
    const unauthorizedSigner = "addr_test1qpunauthorized_fake_address_that_is_not_in_authorized_list";
    const unauthorizedSigners = [authorizedAddresses[0], authorizedAddresses[1], unauthorizedSigner];
    const result5 = validateMultisigRequirements(authorizedAddresses, unauthorizedSigners);
    console.log(`   Resultado: ${result5.isValid ? '✅' : '❌'} ${result5.message}`);
    
    console.log("\n" + "=".repeat(60));
    console.log("📊 RESUMEN DE PRUEBAS");
    console.log("=".repeat(60));
    const results = [result1, result2, result3, result4, result5];
    const validResults = results.filter(r => r.isValid).length;
    const invalidResults = results.filter(r => !r.isValid).length;
    
    console.log(`✅ Escenarios válidos: ${validResults}/5`);
    console.log(`❌ Escenarios inválidos: ${invalidResults}/5`);
    console.log(`🎯 Comportamiento esperado: 1 válido, 4 inválidos`);
    
    if (validResults === 1 && invalidResults === 4) {
        console.log("🎉 TODAS LAS PRUEBAS PASARON CORRECTAMENTE");
    } else {
        console.log("⚠️  RESULTADOS INESPERADOS - REVISAR LÓGICA");
    }
    
    console.log("=".repeat(60));
}

runMultisigTests().catch(console.error);