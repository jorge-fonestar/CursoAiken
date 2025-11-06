import { 
    BlockfrostProvider, 
    MeshTxBuilder, 
    MeshWallet,
    NativeScript,
    deserializeAddress
} from "@meshsdk/core"
import { LoadWallet } from "./funciones"
import dotenv from "dotenv"
dotenv.config()

async function main() {
    console.log("Gastando UTXO multisig con Native Script...");
    
    // Verificar configuración del UTXO en .env
    const utxoHash = process.env.MULTISIG_UTXO_HASH;
    const utxoIndex = parseInt(process.env.MULTISIG_UTXO_INDEX || "0");
    const scriptAddress = process.env.MULTISIG_SCRIPT_ADDRESS;
    const scriptCbor = process.env.MULTISIG_SCRIPT_CBOR;
    
    if (!utxoHash || !scriptAddress || !scriptCbor) {
        throw new Error("Configuración multisig incompleta en .env. Ejecuta primero 1-crear-multisig-utxo.ts");
    }
    
    console.log(`UTXO objetivo: ${utxoHash.slice(0, 20)}...#${utxoIndex}`);
    console.log(`Script Address: ${scriptAddress.slice(0, 30)}...`);
    console.log("Cantidad esperada: 100 ADA");
    
    // Proveedor blockchain
    const provider = new BlockfrostProvider(process.env.BLOCKFROST_APIKEY || "");
    
    // Cargar las 5 wallets autorizadas desde .env
    const wallets: MeshWallet[] = [];
    const pubKeyHashes: string[] = [];
    
    for (let i = 1; i <= 5; i++) {
        const seedEnv = process.env[`WALLET_SEEDS_${i}`];
        if (!seedEnv) throw new Error(`WALLET_SEEDS_${i} no encontrada`);
        
        const wallet = LoadWallet(seedEnv);
        wallets.push(wallet);
        
        // Obtener el public key hash de cada wallet (necesario para el script)
        const walletAddress = wallet.getChangeAddress();
        const { pubKeyHash } = deserializeAddress(walletAddress);
        pubKeyHashes.push(pubKeyHash);
    }
    
    console.log(`Wallets autorizadas cargadas: ${wallets.length}`);
    
    // Recrear el Native Script (debe ser idéntico al original)
    const script: NativeScript = {
        type: "atLeast",
        required: 3,
        scripts: pubKeyHashes.map(keyHash => ({
            type: "sig",
            keyHash: keyHash,
        }))
    };
    
    // Seleccionar 3 wallets para firmar (wallets 1, 2 y 3)
    const signingWallets = [wallets[0], wallets[1], wallets[2]];
    const signingAddresses = await Promise.all(signingWallets.map(w => w.getChangeAddress()));
    
    console.log("Firmantes seleccionados para el multisig 3-of-5:");
    signingAddresses.forEach((addr, i) => {
        console.log(`  Firmante ${i + 1}: ${addr.slice(0, 30)}...`);
    });
    
    // Usar la información del UTXO directamente desde .env
    // (MeshJS tiene problemas consultando direcciones de script)
    console.log("Usando información del UTXO desde configuración...");
    
    const expectedAmount = "100000000"; // 100 ADA
    
    // Construir el objeto UTXO manualmente con la información que tenemos
    const targetUtxo = {
        input: {
            txHash: utxoHash,
            outputIndex: utxoIndex
        },
        output: {
            amount: [{ unit: "lovelace", quantity: expectedAmount }],
            address: scriptAddress
        }
    };
    
    console.log("✅ UTXO objetivo configurado para gastar desde el script");
    
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
    
    // Configurar inputs y outputs
    let tx = txBuilder
        .txIn(
            targetUtxo.input.txHash,
            targetUtxo.input.outputIndex,
            targetUtxo.output.amount,
            scriptAddress
        )
        .txInScript(scriptCbor); // Proporcionar el script para validar
    
    // Añadir outputs para cada destinatario
    for (let i = 0; i < signingAddresses.length; i++) {
        const amount = amountPerRecipient + (i === 0 ? remainder : 0);
        tx = tx.txOut(signingAddresses[i], [{ unit: "lovelace", quantity: amount.toString() }]);
        console.log(`Output ${i + 1}: ${amount / 1000000} ADA a ${signingAddresses[i].slice(0, 30)}...`);
    }
    
    // Completar transacción
    const unsignedTx = await tx
        .changeAddress(signingAddresses[0]) // Change a la primera firmante
        .complete();
    
    console.log("Transacción construida");
    
    // FIRMAR CON LAS 3 WALLETS (Native Script requiere las firmas)
    console.log("Aplicando firmas multisig requeridas por el Native Script...");
    let signedTx = unsignedTx;
    
    for (let i = 0; i < signingWallets.length; i++) {
        console.log(`Firmando con wallet ${i + 1}...`);
        signedTx = await signingWallets[i].signTx(signedTx, true); // partial signing
    }
    
    console.log("✅ 3 firmas aplicadas exitosamente");
    
    // Enviar transacción
    const txHash = await provider.submitTx(signedTx);
    
    console.log(`Transacción enviada: ${txHash}`);
    console.log("Fondos liberados del Native Script y distribuidos exitosamente");
    
    console.log("\n" + "=".repeat(60));
    console.log("📊 RESUMEN DE LA OPERACIÓN MULTISIG CON NATIVE SCRIPT");
    console.log("=".repeat(60));
    console.log(`✅ Script utilizado: Native Script 3-of-5`);
    console.log(`✅ Dirección del script: ${scriptAddress.slice(0, 40)}...`);
    console.log(`✅ UTXO gastado: ${utxoHash.slice(0, 20)}...#${utxoIndex}`);
    console.log(`✅ Firmantes utilizados: ${signingWallets.length}`);
    console.log(`✅ Distribución: ${amountPerRecipient / 1000000} ADA por firmante`);
    console.log(`✅ TxHash: ${txHash}`);
    console.log("✅ Los fondos fueron validados por la blockchain usando Native Script");
    console.log("=".repeat(60));
}

main().catch(console.error);