console.log("=== INICIANDO APLICACIÓN ===");

import { BlockfrostProvider, MeshTxBuilder, MeshWallet } from "@meshsdk/core"
console.log("MeshWallet importado correctamente");
    
import dotenv from "dotenv"
dotenv.config()


console.log("Iniciando programa...");

(async () => {
try {
    // const nueva_seed = MeshWallet.brew() as string[];
    const blockchainProvider = new BlockfrostProvider(process.env.BLOCKFROST_APIKEY || "");
    
    // Cargar las semillas de la wallet
    let seed: string[];
    const SEED = process.env.WALLET_SEEDS || "[]";
    seed = JSON.parse(SEED) as string[];
    
    const wallet = new MeshWallet({
        networkId: parseInt(process.env.NETWORK_ID || "0") as 0 | 1,
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
        key: {
            type: "mnemonic",
            words: seed
        }
    });


    async function transfer() {
        console.log("=== INICIANDO TRANSFER ===");
        
        const walletAddr = await wallet.getChangeAddress();
        console.log("Wallet Address:", walletAddr);

        const UTxOs = await wallet.getUtxos();
        console.log("UTxOs encontrados:", UTxOs.length);

        const txBuilder = new MeshTxBuilder({
            fetcher: blockchainProvider,
            verbose: false
        });

        console.log("=== CONSTRUYENDO TRANSACCIÓN ===");
        const tx = await txBuilder
            .txOut(
                'addr_test1qqksp3wc9famp2wypkyq5qw3sumje38r5jmg6tzdf6g2gfsyseptvhdfcesc20538mdwyu2kcp2mwqsmu2f70509dnlqy6nqqd', 
                [{unit: 'lovelace', quantity: '5000000'}]
            )
            .changeAddress(walletAddr)
            .selectUtxosFrom(UTxOs)
            .complete()
        ;   
        console.log("Transacción construida exitosamente");

        // Firmar la transacción
        //console.log("=== FIRMANDO TRANSACCIÓN ===");
        //const signedTx = await wallet.signTx(tx);
        //console.log("Transacción firmada:", signedTx);

        // Enviar la transacción a la blockchain
        //console.log("=== ENVIANDO TRANSACCIÓN ===");
        //const txHash = await wallet.submitTx(signedTx);
        //console.log("Transacción enviada. Hash:", txHash);

        //return txHash;
        
    }

    await transfer();
    console.log("=== FIN DE LA APLICACIÓN ===");

} catch (error) {
    console.error("Error:", error);
}
})();

