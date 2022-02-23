/* eslint-disable @typescript-eslint/await-thenable */
import { deployments, getNamedAccounts } from 'hardhat';
import { DeployResult } from 'hardhat-deploy/types';
import Web3 from 'web3';
import { deployRoleRegistry } from '../authentication/accounts';
import { createPermission, grantPermission } from '../authentication/permissions';

export async function deployFiniteStateMachineSystem(
  accounts: string[],
  gatekeeper: DeployResult,
  stateMachine: string,
  upgradeableRegistry: string,
  roleRegistries: string[] = [],
  uiDefinitions: object = {},
  extraParams: any[] = [],
  storeIpfsHash: (data: any) => Promise<string>
): Promise<DeployResult> {
  const { deployer } = await getNamedAccounts();
  const { deploy, execute, read } = deployments;

  const dRegistry = await deploy(upgradeableRegistry, {
    from: deployer,
    args: [gatekeeper.address],
    log: true,
  });

  const params = [gatekeeper.address, dRegistry.address, ...extraParams];

  const dStateMachine = await deploy(stateMachine, {
    from: deployer,
    args: params,
    log: true,
  });

  const web3 = new Web3();

  // Give UPGRADE_CONTRACT permissions to accounts[0]
  const permissionManager = await read(
    'GateKeeper',
    'getPermissionManager',
    dRegistry.address,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.fromAscii('UPGRADE_CONTRACT'))
  );
  if (permissionManager === '0x0000000000000000000000000000000000000000') {
    // Give UPGRADE_CONTRACT permissions to accounts[0]
    await createPermission(gatekeeper, dRegistry, 'UPGRADE_CONTRACT', accounts[0], accounts[0]);
  } else {
    await grantPermission(gatekeeper, dRegistry, 'UPGRADE_CONTRACT', accounts[0]);
  }
  // Give admin permission to accounts[0]
  await createPermission(gatekeeper, dStateMachine, 'CREATE_STATEMACHINE_ROLE', accounts[0], accounts[0]);

  // Set create state machine role permissions on the relevant role registries
  for (const roleRegistry of roleRegistries) {
    const dRoleRegistry = await deployRoleRegistry(roleRegistry, gatekeeper, deployer);
    await grantPermission(gatekeeper, dStateMachine, 'CREATE_STATEMACHINE_ROLE', dRoleRegistry.address);
  }

  // Give admin permission to accounts[0]
  await createPermission(gatekeeper, dStateMachine, 'UPDATE_UIFIELDDEFINITIONS_ROLE', accounts[0], accounts[0]);

  if (Object.keys(uiDefinitions).length) {
    const hash = await storeIpfsHash(uiDefinitions);
    await execute(
      stateMachine,
      {
        from: deployer,
        log: true,
      },
      'setUIFieldDefinitionsHash',
      hash
    );
  }

  return dStateMachine;
}

export async function deployStateMachineSystem(
  accounts: string[],
  gatekeeper: DeployResult,
  registry: string,
  factory: string,
  roles: string[],
  uiDefinitions: object = {},
  storeIpfsHash: (data: any) => Promise<string>
) {
  const { deployer } = await getNamedAccounts();
  const { deploy, execute } = deployments;

  const dRegistry = await deploy(registry, {
    from: deployer,
    args: [gatekeeper.address],
    log: true,
  });

  await createPermission(gatekeeper, dRegistry, 'INSERT_STATEMACHINE_ROLE', accounts[0], accounts[0]);

  const deployedFactory = await deploy(factory, {
    from: deployer,
    log: true,
    args: [gatekeeper.address, dRegistry.address],
  });
  // Give admin permission to accounts[0]
  await createPermission(gatekeeper, deployedFactory, 'CREATE_STATEMACHINE_ROLE', accounts[0], accounts[0]);

  await createPermission(gatekeeper, deployedFactory, 'UPDATE_UIFIELDDEFINITIONS_ROLE', accounts[0], accounts[0]);

  // Set create expense permissions on the relevant role registries
  for (const role of roles) {
    const dRoleRegistry = await deployRoleRegistry(role, gatekeeper, deployer);
    await grantPermission(gatekeeper, deployedFactory, 'CREATE_STATEMACHINE_ROLE', dRoleRegistry.address);
  }

  // set the permissions on the factory
  await grantPermission(gatekeeper, gatekeeper, 'CREATE_PERMISSIONS_ROLE', deployedFactory.address);

  await grantPermission(gatekeeper, dRegistry, 'INSERT_STATEMACHINE_ROLE', deployedFactory.address);

  if (Object.keys(uiDefinitions).length) {
    const hash = await storeIpfsHash(uiDefinitions);
    await execute(
      factory,
      {
        from: deployer,
        log: true,
      },
      'setUIFieldDefinitionsHash',
      hash
    );
  }

  return {
    registry: dRegistry,
    factory: deployedFactory,
  };
}
