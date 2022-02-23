import { DeployFunction } from 'hardhat-deploy/types';
import { createPermission, grantPermission } from '../_helpers/authentication/permissions';
import { enabledFeatures } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();
  if (!deployer) {
    console.error(
      '\n\nERROR!\n\nThe node you are deploying to does not have access to a private key to sign this transaction. Add a Private Key in this application to solve this.\n\n'
    );
    process.exit(1);
  }
  if (enabledFeatures.includes('IDENTITIES')) {
    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });
    const dRegistry = await deploy('IdentityRegistry', {
      from: deployer,
      args: [dGateKeeper.address],
      log: true,
    });
    const dIdentity = await deploy('Identity', {
      from: deployer,
      args: [dGateKeeper.address],
      log: true,
    });

    // Give UPGRADE_CONTRACT permissions to accounts[0]
    await createPermission(dGateKeeper, dRegistry, 'UPGRADE_CONTRACT', deployer, deployer);
    // await dRegistry.upgrade(dIdentity.address);
    await execute(
      'IdentityRegistry',
      {
        from: deployer,
        log: true,
      },
      'upgrade',
      dIdentity.address
    );

    // Give admin permission to accounts[0]
    await createPermission(dGateKeeper, dIdentity, 'MANAGE_DIGITALTWIN_ROLE', deployer, deployer);

    for (const roleRegistry of ['AdminRoleRegistry', 'UserRoleRegistry']) {
      await grantPermission(
        dGateKeeper,
        dIdentity,
        'MANAGE_DIGITALTWIN_ROLE',
        await (
          await ethers.getContract(roleRegistry)
        ).address
      );
    }

    // Give admin permission to accounts[0]
    await createPermission(dGateKeeper, dIdentity, 'UPDATE_UIFIELDDEFINITIONS_ROLE', deployer, deployer);
  }
  return true;
};

export default migrate;
migrate.id = '11_deploy_identities';
migrate.tags = ['Identities'];
