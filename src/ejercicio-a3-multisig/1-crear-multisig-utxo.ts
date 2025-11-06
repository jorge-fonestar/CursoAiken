import { BlockfrostProvider, MeshTxBuilder, MeshWallet } from "@meshsdk/core"
import { LoadWallet } from "./funciones"
import dotenv from "dotenv"
dotenv.config()

async function main() {
    console.log("Creando UTXO con 100 ADA para multisig...");
    
    // Proveedor blockchain
    const provider = new BlockfrostProvider(process.env.BLOCKFROST_APIKEY || "");

    // Cargar wallet para enviar fondos
    const walletOrigen = LoadWallet(process.env.WALLET_SEEDS || "[]");
    
    // Cargar wallets firmantes desde .env
    const wallets: MeshWallet[] = [];
    for (let i = 1; i <= 5; i++) {
        const seedEnv = process.env[`WALLET_SEEDS_${i}`];
        if (!seedEnv) throw new Error(`WALLET_SEEDS_${i} no encontrada`);
        
        const wallet = LoadWallet(seedEnv);
        wallets.push(wallet);
    }
    console.log(`Wallets autorizadas cargadas: ${wallets.length}`);

    
    // Crear UTXO con 100 ADA en la wallet origen, que representará los fondos que requieren 3-de-5 firmas
    const AddressOrigen = walletOrigen.getChangeAddress();
    const utxos = await walletOrigen.getUtxos();
    const txBuilder = new MeshTxBuilder({ 
        fetcher: provider,
        verbose: false 
    });
    
    const unsignedTx = await txBuilder
        .txOut(AddressOrigen, [{ unit: "lovelace", quantity: "100000000" }]) // 100 ADA
        .changeAddress(AddressOrigen)
        .selectUtxosFrom(utxos)
        .complete();

    const signedTx = await walletOrigen.signTx(unsignedTx);
    const txHash = await walletOrigen.submitTx(signedTx);

    console.log(`Transacción enviada: ${txHash}`);
    console.log("UTXO de 100 ADA creado exitosamente");
    
    console.log("\n" + "=".repeat(50));
    console.log("📋 INFORMACIÓN PARA EL .ENV");
    console.log("=".repeat(50));
    console.log(`MULTISIG_UTXO_HASH="${txHash}"`);
    console.log(`MULTISIG_UTXO_INDEX="0"`);
}

main().catch(console.error);