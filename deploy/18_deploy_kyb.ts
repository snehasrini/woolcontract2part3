import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  if (enabledFeatures.includes('KYB')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/knowyourbusiness/UIDefinitions.json');
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;
    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    await deployStateMachineSystem(
      [deployer],
      dGateKeeper,
      'KnowYourBusinessRegistry',
      'KnowYourBusinessFactory',
      ['AdminRoleRegistry', 'RequesterRoleRegistry'],
      uiDefinitions,
      storeIpfsHash
    );

    const KnowYourBusinesss = [
      {
        Name: 'Good_Business',
        Address: 'Street-1',
        Products: 'Premium_Products',
        Year_of_Incorporation: '1995',
        Registration_Number: '554848',
        Contact_Details: 'abc@mail.com',
      },
    ];

    const artifact = await deployments.getArtifact('KnowYourBusiness');
    await deployments.save('KnowYourBusiness', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('KnowYourBusiness')),
      address: '',
    });

    for (const KnowYourBusiness of KnowYourBusinesss) {
      await createKnowYourBusiness(KnowYourBusiness, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '18_deploy_kyb';
migrate.tags = ['KYB'];

async function createKnowYourBusiness(
  KnowYourBusiness: {
    Name: string;

    Address: string;
    Products: string;
    Year_of_Incorporation: string;
    Registration_Number: string;
    Contact_Details: string;
  },
  deployer: string
) {
  const ipfsHash = await storeIpfsHash({
    Address: KnowYourBusiness.Address,
    Products: KnowYourBusiness.Products,
    Year_of_Incorporation: KnowYourBusiness.Year_of_Incorporation,
    Registration_Number: KnowYourBusiness.Registration_Number,
    Contact_Details: KnowYourBusiness.Contact_Details,
  });
  // await factory.create(KnowYourBusiness.Name, ipfsHash);
  await deployments.execute(
    'KnowYourBusinessFactory',
    { from: deployer, log: true },
    'create',
    KnowYourBusiness.Name,
    ipfsHash
  );
}
