import dayjs from 'dayjs';
import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  if (enabledFeatures.includes('DRUGPACKAGE')) {
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
      'DrugPackageRegistry',
      'DrugPackageFactory',
      ['AdminRoleRegistry', 'ManufacturerRoleRegistry'],
      uiDefinitions,
      storeIpfsHash
    );

    const DrugPackages = [
      {
        labellerCode: '63851',
        productCode: '501',
        packageCode: '02',
        type: 'Vaccine',
        name: 'RabAvert',
        dosageForm: 'Injection',
        labeller: 'GSK Vaccines GmbH',
        manufacturingDate: dayjs().subtract(3, 'month').unix(),
        packageDesign: 'QmfMRTV5iXVf8gf12V8wTosvHWpf3jkuDeYvEcHXLxZ69G',
      },
      {
        labellerCode: '66828',
        productCode: '0030',
        packageCode: '02',
        type: 'Human Prescription Drug',
        name: 'Gleevec',
        dosageForm: 'Tablet',
        labeller: 'Novartis Pharma Produktions GmbH',
        activeSubstance: 'Imatinib Mesylate',
        manufacturingDate: dayjs().subtract(3, 'year').unix(),
        packageDesign: 'QmQw3cFPLR57xaSg5iC7hjABZLMh2xemiskcuLMRZwwxgH',
      },
    ];

    const artifact = await deployments.getArtifact('DrugPackage');
    await deployments.save('DrugPackage', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('DrugPackage')),
      address: '',
    });

    for (const drugPackage of DrugPackages) {
      await createDrugPackage(drugPackage, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '03_deploy_drugpackage';
migrate.tags = ['DrugPackage'];

async function createDrugPackage(
  drugPackage: {
    labellerCode: string;
    productCode: string;
    packageCode: string;
    type: string;
    name: string;
    dosageForm: string;
    labeller: string;
    activeSubstance?: string;
    manufacturingDate: number;
    packageDesign: string;
  },
  deployer: string
) {
  const ipfsHash = await storeIpfsHash({
    type: drugPackage.type,
    name: drugPackage.name,
    dosageForm: drugPackage.dosageForm,
    labeller: drugPackage.labeller,
    activeSubstance: drugPackage.activeSubstance,
    manufacturingDate: drugPackage.manufacturingDate,
    packageDesign: drugPackage.packageDesign,
  });
  // await factory.create(drugPackage.labellerCode, drugPackage.productCode, drugPackage.packageCode, ipfsHash);
  await deployments.execute(
    'DrugPackageFactory',
    { from: deployer, log: true },
    'create',
    drugPackage.labellerCode,
    drugPackage.productCode,
    drugPackage.packageCode,
    ipfsHash
  );
}
