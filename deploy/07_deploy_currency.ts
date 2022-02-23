import { DeployFunction } from 'hardhat-deploy/types';
import { deployERC20TokenSystem } from '../_helpers/tokens/ERC20';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;
  if (enabledFeatures.includes('CURRENCY')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/currency/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    const artifact = await deployments.getArtifact('Currency');
    await deployments.save('Currency', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('Currency')),
      address: '',
    });

    await deployERC20TokenSystem(
      {
        gatekeeper: dGateKeeper,
        registry: { contract: 'CurrencyRegistry', extraParams: [] },
        factory: { contract: 'CurrencyFactory', extraParams: [] },
        token: {
          contract: 'Currency',
          instances: [
            {
              name: 'Euro',
              decimals: 2,
              extraParams: [],
              issuance: [
                {
                  recipientGroups: ['AdminRoleRegistry', 'UserRoleRegistry'],
                  amount: 10000,
                },
              ],
            },
            {
              name: 'Dollar',
              decimals: 2,
              extraParams: [],
              issuance: [
                {
                  recipientGroups: ['AdminRoleRegistry', 'UserRoleRegistry'],
                  amount: 5000,
                },
              ],
            },
          ],
        },
        roles: ['AdminRoleRegistry'],
      },
      deployer,
      uiDefinitions,
      storeIpfsHash
    );
  }
  return true;
};

export default migrate;
migrate.id = '07_deploy_currency';
migrate.tags = ['Currency'];
