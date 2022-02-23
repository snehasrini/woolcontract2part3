import { create } from 'ipfs-http-client';
import { ipfsNodes } from '../../.secrets/default.hardhat.config';

export const enabledFeatures =
  process.env.ENABLED_FEATURES ||
  'SUPPLYCHAIN'.split(
    ','
  );

export const entethMiddleware = process.env.MIDDLEWARE || '';

// If you have more than one IPFS node, use the key from the default.hardhat.config.ts file to choose which one to use.
const preferredIpfsNode: string | undefined = undefined;

export const storeIpfsHash = async (data: any, quiet = false) => {
  const ipfsNode = preferredIpfsNode ?? Object.keys(ipfsNodes).length > 0 ? Object.keys(ipfsNodes)[0] : 'local';

  try {
    const ipfs = create({
      url: ipfsNodes[ipfsNode].url,
      headers: ipfsNodes[ipfsNode].headers,
    });
    const { cid } = await ipfs.add({ content: Buffer.from(JSON.stringify(data)) });

    if (!quiet) {
      console.log(`--> Stored a file on IPFS: ${cid.toString()}`);
    }
    return cid.toString();
  } catch (error) {
    return '0';
  }
};
