import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployFiniteStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  if (enabledFeatures.includes('SUPPLYPACKAGE')) {
    const { deploy, execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    const _package = await deployFiniteStateMachineSystem(
      [deployer],
      dGateKeeper,
      'Package',
      'PackageRegistry',
      ['AdminRoleRegistry'],
      {},
      [],
      storeIpfsHash
    );

    const dPackage = await ethers.getContractAt('Package', _package.address);
    const allRoles = await dPackage.allRoles();

    for (const role of allRoles) {
      await execute(
        'GateKeeper',
        { from: deployer, log: true },
        'createPermission',
        deployer,
        dPackage.address,
        role,
        deployer
      );
    }
    const packages = [
      {
        name: 'FPP2 masks',
        comment: 'Maskers voor COVID-19 bestrijding',
        isMedical: true,
        tiltable: true,
        temperatureIgnored: true,
        temperatureThreshold: 0,
      },
      {
        name: 'Curry Ketchup',
        comment: 'Delhaize Curry Ketchup',
        isMedical: false,
        tiltable: true,
        temperatureIgnored: false,
        temperatureThreshold: 4,
      },
    ];

    for (const apackage of packages) {
      await createPackage(apackage, deployer, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '19_deploy_supplypackage';
migrate.tags = ['SupplyPackage'];

async function createPackage(packageData: IPackageData, owner: string, deployer: string) {
  const ipfsHash = await storeIpfsHash({
    name: packageData.name,
    comment: packageData.comment,
    isMedical: packageData.isMedical,
    tiltable: packageData.tiltable,
    temperatureIgnored: packageData.temperatureIgnored,
    temperatureThreshold: packageData.temperatureThreshold,
  });

  const tx = await deployments.execute(
    'Package',
    { from: deployer, log: true },
    'create',
    packageData.name,
    packageData.comment,
    packageData.isMedical,
    packageData.tiltable,
    packageData.temperatureIgnored,
    packageData.temperatureThreshold,
    ipfsHash,
    owner
  );
  console.log(`Created package ${packageData.name}: ${tx.transactionHash}`);
}

interface IPackageData {
  name: string;
  comment: string;
  isMedical: boolean;
  tiltable: boolean;
  temperatureIgnored: boolean;
  temperatureThreshold: number;
}
