import { DeployFunction } from 'hardhat-deploy/types';
import { deployERC20TokenSystem } from '../_helpers/tokens/ERC20';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;
  if (enabledFeatures.includes('LOYALTYPOINTS')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/loyaltypoint/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    const artifact = await deployments.getArtifact('LoyaltyPoint');
    await deployments.save('LoyaltyPoint', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('LoyaltyPoint')),
      address: '',
    });

    await deployERC20TokenSystem(
      {
        gatekeeper: dGateKeeper,
        registry: { contract: 'LoyaltyPointRegistry', extraParams: [] },
        factory: { contract: 'LoyaltyPointFactory', extraParams: [] },
        token: {
          contract: 'LoyaltyPoint',
          instances: [
            {
              name: 'Skywards',
              decimals: 8,
              extraParams: [],
              issuance: [
                {
                  recipientGroups: ['AdminRoleRegistry', 'UserRoleRegistry'],
                  amount: 45000,
                },
              ],
            },
            {
              name: 'Miles and More',
              decimals: 18,
              extraParams: [],
              issuance: [
                {
                  recipientGroups: ['AdminRoleRegistry', 'UserRoleRegistry'],
                  amount: 123000,
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
migrate.id = '08_deploy_loyaltypoints';
migrate.tags = ['LoyaltyPoints'];
