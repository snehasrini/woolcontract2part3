import { createPermission, grantPermission } from '../../authentication/permissions';
import { deploy } from '../../util/deploy';
import { deployments, getNamedAccounts } from 'hardhat';

import { IERC20TokenSet } from './index';

export async function deployERC20Factory(tokenSet: IERC20TokenSet, tokenSystemOwner: string, registry: any) {
  const { deployer } = await getNamedAccounts();
  const { deploy: deploymentsDeploy } = deployments;
  const factory: any = await deploy(tokenSet.factory.contract, [
    registry.address,
    tokenSet.gatekeeper.address,
    ...tokenSet.factory.extraParams,
  ]);
  await createPermission(tokenSet.gatekeeper, factory, 'CREATE_TOKEN_ROLE', tokenSystemOwner, tokenSystemOwner);
  // Set create expense permissions on the relevant role registries
  if (tokenSet.roles) {
    for (const role of tokenSet.roles) {
      const dRole = await deploymentsDeploy(role, { from: deployer, args: [tokenSet.gatekeeper.address], log: true });
      await grantPermission(tokenSet.gatekeeper, factory, 'CREATE_TOKEN_ROLE', dRole.address);
    }
  }

  await grantPermission(tokenSet.gatekeeper, registry, 'LIST_TOKEN_ROLE', factory.address);
  await grantPermission(tokenSet.gatekeeper, tokenSet.gatekeeper, 'CREATE_PERMISSIONS_ROLE', factory.address);

  return factory;
}
