import {BlockfrostProvider, MeshWallet} from "@meshsdk/core"
import dotenv from "dotenv"
dotenv.config()

const provider = new BlockfrostProvider(process.env.BLOCKFROST_APIKEY || "");

export function LoadWallet(seed_str: string): MeshWallet {
    const seed = JSON.parse(seed_str) as string[];
    const wallet = new MeshWallet({
        networkId: parseInt(process.env.NETWORK_ID || "0") as 0 | 1,
        fetcher: provider,
        submitter: provider,
        key: { type: "mnemonic", words: seed }
    });
    return wallet;
}