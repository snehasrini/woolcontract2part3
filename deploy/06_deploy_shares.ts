import { DeployFunction } from 'hardhat-deploy/types';
import { deployERC20TokenSystem } from '../_helpers/tokens/ERC20';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;
  if (enabledFeatures.includes('SHARES')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/share/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    const artifact = await deployments.getArtifact('Share');
    await deployments.save('Share', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('Share')),
      address: '',
    });

    await deployERC20TokenSystem(
      {
        gatekeeper: dGateKeeper,
        registry: { contract: 'ShareRegistry', extraParams: [] },
        factory: { contract: 'ShareFactory', extraParams: [] },
        token: {
          contract: 'Share',
          instances: [
            {
              name: 'Apple',
              decimals: 2,
              extraParams: [],
              issuance: [
                {
                  recipientGroups: ['AdminRoleRegistry', 'UserRoleRegistry'],
                  amount: 4500,
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
migrate.id = '06_deploy_shares';
migrate.tags = ['Shares'];
