import { 
    BlockfrostProvider, 
    MeshTxBuilder, 
    MeshWallet,
    NativeScript,
    serializeNativeScript,
    deserializeAddress
} from "@meshsdk/core"
import * as funciones from "./funciones"
import dotenv from "dotenv"
dotenv.config()

async function main() {
    console.log("Creando UTXO con 100 ADA para multisig con Native Script...");
    
    // Proveedor blockchain
    const provider = new BlockfrostProvider(process.env.BLOCKFROST_APIKEY || "");

    // Cargar wallet para enviar fondos
    const walletOrigen = funciones.LoadWallet(process.env.WALLET_SEEDS || "[]");
    
    // Cargar wallets autorizadas desde .env
    const wallets: MeshWallet[] = [];
    const pubKeyHashes: string[] = [];
    
    for (let i = 1; i <= 5; i++) {
        const seedEnv = process.env[`WALLET_SEEDS_${i}`];        
        if (!seedEnv) throw new Error(`WALLET_SEEDS_${i} no encontrada`);

        const wallet = funciones.LoadWallet(seedEnv);
        wallets.push(wallet);
        
        // Obtener el public key hash de cada wallet
        const walletAddress = wallet.getChangeAddress();
        const { pubKeyHash } = deserializeAddress(walletAddress);
        pubKeyHashes.push(pubKeyHash);
    }
    
    console.log(`Wallets autorizadas cargadas: ${wallets.length}`);
    
    // CREAR NATIVE SCRIPT: Requiere 3 de 5 firmas
    const script: NativeScript = {
        type: "atLeast",
        required: 3,
        scripts: pubKeyHashes.map(keyHash => ({
            type: "sig",
            keyHash: keyHash,
        }))
    };
    console.log("Native Script 3-of-5 creado");
    
    // Serializar el script para obtener la dirección
    const { address, scriptCbor } = serializeNativeScript(script);
    if (!scriptCbor) {
        throw "No se pudo serializar el script";
    }
    
    console.log(`Dirección del script: ${address}`);
    
    // Crear UTXO con 100 ADA en la DIRECCIÓN DEL SCRIPT
    const AddressOrigen = walletOrigen.getChangeAddress();
    const utxos = await walletOrigen.getUtxos();
    
    const txBuilder = new MeshTxBuilder({ 
        fetcher: provider,
        verbose: false 
    });
    
    // Enviar 100 ADA a la DIRECCIÓN DEL SCRIPT (no a wallet normal)
    const unsignedTx = await txBuilder
        .txOut(address, [{ unit: "lovelace", quantity: "100000000" }]) // 100 ADA a la dirección del script
        .changeAddress(AddressOrigen) // Change de vuelta a la wallet origen
        .selectUtxosFrom(utxos)
        .complete();

    const txHash = await funciones.FirmarTx(walletOrigen, unsignedTx);

    console.log(`Transacción enviada: ${txHash}`);
    console.log("UTXO de 100 ADA creado exitosamente EN LA DIRECCIÓN DEL SCRIPT");
    console.log(`Los fondos están bloqueados por Native Script 3-of-5`);
    
    console.log("\n" + "=".repeat(60));
    console.log("📋 INFORMACIÓN DEL NATIVE SCRIPT");
    console.log("=".repeat(60));
    console.log(`Dirección del script: ${address}`);
    console.log(`Script CBOR: ${scriptCbor.slice(0, 40)}...`);
    console.log(`Firmas requeridas: 3 de 5`);
    
    console.log("\n" + "=".repeat(50));
    console.log("📋 INFORMACIÓN PARA EL .ENV");
    console.log("=".repeat(50));
    console.log(`MULTISIG_UTXO_HASH="${txHash}"`);
    console.log(`MULTISIG_UTXO_INDEX="0"`);
    console.log(`MULTISIG_SCRIPT_ADDRESS="${address}"`);
    console.log(`MULTISIG_SCRIPT_CBOR="${scriptCbor}"`);

}

main().catch(console.error);