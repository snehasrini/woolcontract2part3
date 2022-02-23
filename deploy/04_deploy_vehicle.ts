import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  if (enabledFeatures.includes('VEHICLE')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/drugpackage/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    await deployStateMachineSystem(
      [deployer],
      dGateKeeper,
      'VehicleRegistry',
      'VehicleFactory',
      ['AdminRoleRegistry', 'ManufacturerRoleRegistry'],
      uiDefinitions,
      storeIpfsHash
    );

    const Vehicles = [
      {
        vin: '5YJXCAE45GFF00001',
        owner: '0xfd79b7a0b6f8e8ab147f3a38b0542b4d52538b0e',
        mileage: 0,
        type: 'Car',
        plateNumber: '425382',
        firstRegistrationDate: 1558362520,
        make: 'Tesla',
        model: 'Model X P90D',
        channel: 'Broker',
        origin: 'GCC',
        GCCPlateNumber: 'I37921',
      },
      {
        vin: '5YJRE1A31A1P01234',
        owner: '0xa8ff056cffef6ffc662a069a69f3f3fdddb07902',
        mileage: 10000,
        type: 'Car',
        plateNumber: '123054',
        firstRegistrationDate: 1558062520,
        make: 'Tesla',
        model: 'Roadster',
        channel: 'Agent',
        origin: 'Other',
      },
    ];

    const artifact = await deployments.getArtifact('Vehicle');
    await deployments.save('Vehicle', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('Vehicle')),
      address: '',
    });

    for (const vehicle of Vehicles) {
      await createVehicle(vehicle, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '04_deploy_vehicle';
migrate.tags = ['Vehicle'];

async function createVehicle(
  vehicle: {
    vin: string;
    owner: string;
    mileage: number;
    type: string;
    plateNumber: string;
    firstRegistrationDate: number;
    make: string;
    model: string;
    channel: string;
    origin: string;
    GCCPlateNumber?: string;
  },
  deployer: string
) {
  const ipfsHash = await storeIpfsHash({
    type: vehicle.type,
    plateNumber: vehicle.plateNumber,
    firstRegistrationDate: vehicle.firstRegistrationDate,
    make: vehicle.make,
    model: vehicle.model,
    channel: vehicle.channel,
    origin: vehicle.origin,
    GCCPlateNumber: vehicle.GCCPlateNumber,
  });
  // await factory.create(vehicle.vin, vehicle.owner, vehicle.mileage, ipfsHash);
  await deployments.execute(
    'VehicleFactory',
    { from: deployer, log: true },
    'create',
    vehicle.vin,
    vehicle.owner,
    vehicle.mileage,
    ipfsHash
  );
}
