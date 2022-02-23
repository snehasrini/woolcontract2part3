This repo and contracts is based on the Enterprise Ethereum Middleware template libary and packaged so it can be deployed via the BPaaS

## Deploy

The middleware admin user is created with the mnemonic of the blockchain node. So, in order to provide required roles to the admin user, you need to replace the `config` constants in the `./hardhat.config.ts` with following and replace `<your_node_public_key>`, `<your_node_menomic>`, `<your_node_derivation_path>` and `<your_node_private_key>` from your node's details page.
```
const config: HardhatUserConfig = {
  ...bpaasConfig,
  namedAccounts: {
    ...bpaasConfig.namedAccounts,
    "deployer": {
      "default": "<your_node_public_key>"
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
                mnemonic: '<your_node_menomic>',
                path: "<your_node_derivation_path>"
              }: ['<your_node_private_key>']
            };
            return acc;
          }
        }, {})
      : {},
};
```

To deploy this smart contract set, execute `yarn smartcontract:deploy` or to deploy again from scratch, execute `yarn smartcontract:deploy:reset`.

In `_helpers/util/global.ts` you can limit the smart contracts that are being deployed by updating the `enabledFeatures` constants.

## Using the smart contracts with the Enterprise Ethereum Middleware

Execute `yarn middleware:package` to generate a compressed file which contains all the contract artifacts. This will generate a file `./deployments-for-middleware.tar.gz`.
Right click on it and select `Download`. Later, unzip that file locally.

Then log in to the Middleware and either use the big button at the top if you have never imported contracts yet, or on the left to the contracts section. Then upload all these json files which are present inside in one go.

It will import the json files, and then restart, this can take a while, do not panic if you get errors at this point.
