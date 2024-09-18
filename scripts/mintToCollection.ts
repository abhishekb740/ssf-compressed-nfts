/*
  This script demonstrates how to mint an additional compressed NFT to an existing tree and/or collection
  ---
  NOTE: A collection can use multiple trees to store compressed NFTs, as desired. 
  This example uses the same tree for simplicity.
*/

import { PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  MetadataArgs,
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";

// import custom helpers to mint compressed NFTs
import { WrapperConnection } from "@/ReadApi/WrapperConnection";
import { mintCompressedNFT } from "@/utils/compression";
import {
  loadKeypairFromFile,
  loadOrGenerateKeypair,
  loadPublicKeysFromFile,
  printConsoleSeparator,
} from "@/utils/helpers";

// load the env variables and store the cluster RPC url
import dotenv from "dotenv";
dotenv.config();

(async () => {
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // generate a new Keypair for testing, named `wallet`
  const testWallet = loadOrGenerateKeypair("testWallet");

  // generate a new keypair for use in this demo (or load it locally from the filesystem when available)
  const payer = process.env?.LOCAL_PAYER_JSON_ABSPATH
    ? loadKeypairFromFile(process.env?.LOCAL_PAYER_JSON_ABSPATH)
    : loadOrGenerateKeypair("payer");

  console.log("==== Keypairs loaded ====", payer);

  console.log("Payer address:", payer.publicKey.toBase58());
  console.log("Test wallet address:", testWallet.publicKey.toBase58());

  // load the stored PublicKeys for ease of use
  let keys = loadPublicKeysFromFile();

  // ensure the primary script was already run
  if (!keys?.collectionMint || !keys?.treeAddress)
    return console.warn("No local keys were found. Please run the `index` script");

  const treeAddress: PublicKey = keys.treeAddress;
  const treeAuthority: PublicKey = keys.treeAuthority;
  const collectionMint: PublicKey = keys.collectionMint;
  const collectionMetadataAccount: PublicKey = keys.collectionMetadataAccount;
  const collectionMasterEditionAccount: PublicKey = keys.collectionMasterEditionAccount;

  console.log("==== Local PublicKeys loaded ====");
  console.log("Tree address:", treeAddress.toBase58());
  console.log("Tree authority:", treeAuthority.toBase58());
  console.log("Collection mint:", collectionMint.toBase58());
  console.log("Collection metadata:", collectionMetadataAccount.toBase58());
  console.log("Collection master edition:", collectionMasterEditionAccount.toBase58());

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // load the env variables and store the cluster RPC url
  const CLUSTER_URL = process.env.RPC_URL ?? 'https://mainnet.helius-rpc.com/?api-key=9c284da0-d1c0-4afc-968a-113feff36f4b';

  // create a new rpc connection, using the ReadApi wrapper
  const connection = new WrapperConnection(CLUSTER_URL);

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  printConsoleSeparator();

  /*
    Mint a single compressed NFT
  */

    const compressedNFTMetadata: MetadataArgs = {
      name: "Abhishek | FlameKaiser",
      symbol: "AFK",
      // specific json metadata for each NFT
      uri: "https://amethyst-imaginative-panther-173.mypinata.cloud/ipfs/QmNXFbanPvawELJk5WTqnJaaPNH5daq3WjkExT3vvKQXDa",
      creators: [
        {
          address: payer.publicKey,
          verified: false,
          share: 100,
        }
      ], // or set to null
      editionNonce: 0,
      uses: null,
      collection: null,
      primarySaleHappened: false,
      sellerFeeBasisPoints: 0,
      isMutable: false,
      // these values are taken from the Bubblegum package
      tokenProgramVersion: TokenProgramVersion.Original,
      tokenStandard: TokenStandard.NonFungible,
    };

  // fully mint a single compressed NFT to the payer
  console.log(`Minting a single compressed NFT to HW213kWyudZV3zxC52LFZTXR9zxoeu7BLt9MN6QiR8dB`);

  // const mintToPayer = await mintCompressedNFT(
  //   connection,
  //   payer,
  //   treeAddress,
  //   collectionMint,
  //   collectionMetadataAccount,
  //   collectionMasterEditionAccount,
  //   compressedNFTMetadata,
  //   // mint to this specific wallet (in this case, the tree owner aka `payer`)
  //   new PublicKey("HW213kWyudZV3zxC52LFZTXR9zxoeu7BLt9MN6QiR8dB")
  // );

  // fully mint a single compressed NFT
  console.log(`Minting a single compressed NFT to ${testWallet.publicKey.toBase58()}...`);

  const mintToWallet = await mintCompressedNFT(
    connection,
    payer,
    treeAddress,
    collectionMint,
    collectionMetadataAccount,
    collectionMasterEditionAccount,
    compressedNFTMetadata,
    // mint to this specific wallet (in this case, airdrop to `testWallet`)
    new PublicKey("HW213kWyudZV3zxC52LFZTXR9zxoeu7BLt9MN6QiR8dB")
  );
})();
