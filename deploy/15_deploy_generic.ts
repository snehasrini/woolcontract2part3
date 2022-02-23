import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  if (enabledFeatures.includes('GENERIC')) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/genericstatemachine/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    await deployStateMachineSystem(
      [deployer],
      dGateKeeper,
      'GenericRegistry',
      'GenericFactory',
      ['AdminRoleRegistry'],
      uiDefinitions,
      storeIpfsHash
    );

    // Creation of a test generic SM
    const Generics = [
      {
        param1: 'a',
        param2: '0x3ad941908e73d2214d08237e90cfce11cd490c16',
        param3: 0,
        type: 'd',
        place: 'Belgium',
        creationDate: 1558362520,
        optionalParameter: 'd',
      },
    ];

    const artifact = await deployments.getArtifact('Generic');
    await deployments.save('Generic', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('Generic')),
      address: '',
    });

    for (const generic of Generics) {
      await createGeneric(generic, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '15_deploy_generic';
migrate.tags = ['Generic'];

async function createGeneric(
  generic: {
    param1: string;
    param2: string;
    param3: number;
    place: string;
    creationDate: number;
    type: string;
    optionalParameter?: string;
  },
  deployer: string
) {
  const ipfsHash = await storeIpfsHash({
    place: generic.place,
    type: generic.type,
    creationDate: generic.creationDate,
    optionalParameter: generic.optionalParameter,
  });
  // await factory.create(generic.param1, generic.param2, generic.param3, ipfsHash);
  await deployments.execute(
    'GenericFactory',
    { from: deployer, log: true },
    'create',
    generic.param1,
    generic.param2,
    generic.param3,
    ipfsHash
  );
}
