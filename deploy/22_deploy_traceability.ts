import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  if (enabledFeatures.includes('TRACEABILITY')) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/traceability/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    await deployStateMachineSystem(
      [deployer],
      dGateKeeper,
      'TraceabilityRegistry',
      'TraceabilityFactory',
      ['AdminRoleRegistry'],
      uiDefinitions,
      storeIpfsHash
    );

    const artifact = await deployments.getArtifact('Traceability');
    await deployments.save('Traceability', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('Traceability')),
      address: '',
    });

    // Creation of a test traceability SM
    const Traceabilities = [
      {
        harvestDate: 1603809662,
      },
    ];

    for (const traceability of Traceabilities) {
      await createTraceability(traceability, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '22_deploy_traceability';
migrate.tags = ['Traceability'];

async function createTraceability(
  traceability: {
    harvestDate: number;
  },
  deployer: string
) {
  const ipfsHash = await storeIpfsHash({
    harvestDate: traceability.harvestDate,
  });

  // await factory.create(traceability.harvestDate, ipfsHash);
  await deployments.execute(
    'TraceabilityFactory',
    { from: deployer, log: true },
    'create',
    traceability.harvestDate,
    ipfsHash
  );
}
