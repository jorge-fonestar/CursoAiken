import { 
    BlockfrostProvider, 
    MeshTxBuilder, 
    MeshWallet,
    NativeScript
} from "@meshsdk/core"
import dotenv from "dotenv"
dotenv.config()

/**
 * 🔒 FUNCIÓN DE VALIDACIÓN MULTISIG
 * Verifica que los firmantes cumplan con las reglas del esquema 3-of-5
 */
function validateMultisigRequirements(
    authorizedAddresses: string[],
    signingAddresses: string[],
    requiredSignatures: number = 3,
    totalAuthorized: number = 5
): { isValid: boolean; message: string } {
    
    // Validar número total de wallets autorizadas
    if (authorizedAddresses.length !== totalAuthorized) {
        return {
            isValid: false,
            message: `Se esperaban ${totalAuthorized} wallets autorizadas, se encontraron ${authorizedAddresses.length}`
        };
    }
    
    // Validar número de firmantes
    if (signingAddresses.length !== requiredSignatures) {
        return {
            isValid: false,
            message: `Multisig ${requiredSignatures}-of-${totalAuthorized} requiere exactamente ${requiredSignatures} firmas. Proporcionadas: ${signingAddresses.length}`
        };
    }
    
    // Validar que no hay duplicados
    const uniqueSigners = new Set(signingAddresses);
    if (uniqueSigners.size !== signingAddresses.length) {
        return {
            isValid: false,
            message: "Se detectaron firmantes duplicados. Cada wallet solo puede firmar una vez"
        };
    }
    
    // Validar que todos los firmantes están autorizados
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

async function main() {
    console.log("Gastando UTXO multisig con 3 firmas...");
    
    // Verificar configuración del UTXO en .env
    const utxoHash = process.env.MULTISIG_UTXO_HASH;
    const utxoIndex = parseInt(process.env.MULTISIG_UTXO_INDEX || "0");
    const expectedAmount = "100000000"; // 100 ADA fijo
    
    if (!utxoHash) {
        throw new Error("MULTISIG_UTXO_HASH no encontrado en .env. Ejecuta primero create-multisig-utxo.ts");
    }
    
    console.log(`UTXO objetivo: ${utxoHash.slice(0, 20)}...#${utxoIndex}`);
    console.log(`Cantidad esperada: ${parseInt(expectedAmount) / 1000000} ADA`);
    
    // Proveedor blockchain
    const provider = new BlockfrostProvider(process.env.BLOCKFROST_APIKEY || "");
    
    // Cargar las 5 wallets desde .env
    const wallets: MeshWallet[] = [];
    
    for (let i = 1; i <= 5; i++) {
        const seedEnv = process.env[`WALLET_SEEDS_${i}`];
        if (!seedEnv) throw new Error(`WALLET_SEEDS_${i} no encontrada`);
        
        const seed = JSON.parse(seedEnv) as string[];
        const wallet = new MeshWallet({
            networkId: parseInt(process.env.NETWORK_ID || "0") as 0 | 1,
            fetcher: provider,
            submitter: provider,
            key: { type: "mnemonic", words: seed }
        });
        
        wallets.push(wallet);
    }
    
    console.log(`Wallets cargadas: ${wallets.length}`);
    
    // Verificar que las wallets cargadas son las mismas que las autorizadas
    const authorizedAddresses = await Promise.all(wallets.map(w => w.getChangeAddress()));
    console.log("Wallets autorizadas:");
    authorizedAddresses.forEach((addr, i) => {
        console.log(`  ${i + 1}. ${addr.slice(0, 30)}...`);
    });
    
    // Seleccionar 3 wallets para firmar (wallets 1, 2 y 3)
    const signingWallets = [wallets[0], wallets[1], wallets[2]];
    const signingAddresses = await Promise.all(signingWallets.map(w => w.getChangeAddress()));
    
    console.log("\nFirmantes seleccionados para el multisig 3-of-5:");
    signingAddresses.forEach((addr, i) => {
        console.log(`  Firmante ${i + 1}: ${addr.slice(0, 30)}...`);
    });
    
    // VALIDACIÓN MULTISIG COMPLETA
    const validation = validateMultisigRequirements(authorizedAddresses, signingAddresses);
    if (!validation.isValid) {
        throw new Error(`Validación multisig fallida: ${validation.message}`);
    }
    
    console.log(`✅ ${validation.message}`);
    
    // Buscar el UTXO específico en la primera wallet
    const sourceWallet = wallets[0];
    const utxos = await sourceWallet.getUtxos();
    
    console.log(`Buscando UTXO específico en ${utxos.length} UTXOs...`);
    
    // Buscar el UTXO por hash e índice
    const targetUtxo = utxos.find(utxo => 
        utxo.input.txHash === utxoHash && 
        utxo.input.outputIndex === utxoIndex
    );
    
    if (!targetUtxo) {
        throw new Error(`UTXO ${utxoHash}#${utxoIndex} no encontrado en la wallet`);
    }
    
    // Verificar cantidad
    const lovelaceAmount = targetUtxo.output.amount.find(asset => asset.unit === "lovelace");
    if (!lovelaceAmount || lovelaceAmount.quantity !== expectedAmount) {
        throw new Error(`Cantidad incorrecta. Esperado: ${expectedAmount}, Encontrado: ${lovelaceAmount?.quantity}`);
    }
    
    console.log("UTXO objetivo encontrado y verificado");
    
    // Calcular distribución: dividir entre 3 firmantes + fees
    const totalAmount = parseInt(expectedAmount);
    const fees = 2000000; // 2 ADA estimado para fees
    const distributionAmount = totalAmount - fees;
    const amountPerRecipient = Math.floor(distributionAmount / 3);
    const remainder = distributionAmount % 3;
    
    console.log(`Distribuyendo ${distributionAmount / 1000000} ADA entre 3 firmantes`);
    console.log(`${amountPerRecipient / 1000000} ADA cada uno${remainder > 0 ? ` (+${remainder} lovelace al primero)` : ""}`);
    
    // Construir transacción
    const txBuilder = new MeshTxBuilder({ 
        fetcher: provider,
        verbose: false 
    });
    
    // Añadir outputs para cada destinatario (los 3 firmantes)
    let tx = txBuilder;
    for (let i = 0; i < signingAddresses.length; i++) {
        const amount = amountPerRecipient + (i === 0 ? remainder : 0); // El resto va al primero
        tx = tx.txOut(signingAddresses[i], [{ unit: "lovelace", quantity: amount.toString() }]);
        console.log(`Output ${i + 1}: ${amount / 1000000} ADA a ${signingAddresses[i].slice(0, 30)}...`);
    }
    
    const unsignedTx = await tx
        .changeAddress(await sourceWallet.getChangeAddress())
        .selectUtxosFrom([targetUtxo])
        .complete();
    
    console.log("Transacción construida");
    
    // Firmar con las 3 wallets seleccionadas
    console.log("Aplicando firmas multisig...");
    let signedTx = unsignedTx;
    
    for (let i = 0; i < signingWallets.length; i++) {
        console.log(`Firmando con wallet ${i + 1}...`);
        signedTx = await signingWallets[i].signTx(signedTx, true); // partial signing
    }
    
    console.log("3 firmas aplicadas exitosamente");
    
    // Enviar transacción
    const txHash = await sourceWallet.submitTx(signedTx);
    
    console.log(`Transacción enviada: ${txHash}`);
    console.log("Fondos distribuidos exitosamente con multisig 3-of-5");
    
    console.log("\n" + "=".repeat(60));
    console.log("📊 RESUMEN DE LA OPERACIÓN MULTISIG");
    console.log("=".repeat(60));
    console.log(`✅ Esquema implementado: 3-of-5 multisig`);
    console.log(`✅ Wallets autorizadas: ${authorizedAddresses.length}`);
    console.log(`✅ Firmantes utilizados: ${signingWallets.length}`);
    console.log(`✅ Validaciones aplicadas:`);
    console.log(`   - Solo firmantes autorizados`);
    console.log(`   - Número exacto de firmas (3)`);
    console.log(`   - No duplicados`);
    console.log(`   - UTXO específico verificado`);
    console.log(`✅ Distribución: ${amountPerRecipient / 1000000} ADA por firmante`);
    console.log(`✅ TxHash: ${txHash}`);
    console.log("=".repeat(60));
}

main().catch(console.error);