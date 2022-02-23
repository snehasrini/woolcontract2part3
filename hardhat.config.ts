import { HardhatUserConfig } from 'hardhat/config';
import bpaasConfig from './.secrets/default.hardhat.config';

const config: HardhatUserConfig = {
  ...bpaasConfig,
  namedAccounts: {
    ...bpaasConfig.namedAccounts,
    "deployer": {
      "default": "0x30aeb7D1C26C28dbc057e3F86399a9E3CB40CdEe"
    }
  },
  networks:
    // add allowUnlimitedContractSize to the each value inside bpaasConfig.networks

    bpaasConfig.networks
      ? Object.keys(bpaasConfig.networks).reduce((acc: any, networkName: string) => {
          if (bpaasConfig.networks && bpaasConfig.networks[networkName]) {
            acc[networkName] = {
              ...bpaasConfig.networks[networkName],
              allowUnlimitedContractSize: true,
              accounts: networkName==='hardhat'? {
                mnemonic: 'original accuse merry wedding firm famous story phrase walk brush modify close',
                path: "m/44'/60'/0'/0/0"
              }: ['0xe50e8442f6afb5ccd3c79cf19732bca9e61a3d6308478b73d3b4e756d0ac685e']
            };
            return acc;
          }
        }, {})
      : {},
};
export default config;
