import { DeployFunction } from 'hardhat-deploy/types';
import { deployERC20TokenSystem } from '../_helpers/tokens/ERC20';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;
  if (enabledFeatures.includes('LOANS')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/loan/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    const artifact = await deployments.getArtifact('Loan');
    await deployments.save('Loan', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('Loan')),
      address: '',
    });

    await deployERC20TokenSystem(
      {
        gatekeeper: dGateKeeper,
        registry: { contract: 'LoanRegistry', extraParams: [] },
        factory: { contract: 'LoanFactory', extraParams: [] },
        token: {
          contract: 'Loan',
          instances: [
            {
              name: 'Personal loans',
              decimals: 2,
              extraParams: [],
              issuance: [
                {
                  recipientGroups: ['AdminRoleRegistry', 'UserRoleRegistry'],
                  amount: 500,
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
migrate.id = '05_deploy_loans';
migrate.tags = ['Loans'];
