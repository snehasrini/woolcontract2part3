import dayjs from 'dayjs';
import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  if (enabledFeatures.includes('KYC')) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/knowyourcustomer/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    await deployStateMachineSystem(
      [deployer],
      dGateKeeper,
      'KnowYourCustomerRegistry',
      'KnowYourCustomerFactory',
      ['AdminRoleRegistry', 'RequesterRoleRegistry'],
      uiDefinitions,
      storeIpfsHash
    );

    const KnowYourCustomers = [
      {
        Name: 'KYC-1',
        gender: 'Male',
        firstName: 'Thomas',
        middleName: 'Neo',
        lastName: 'Anderson',
        fatherName: 'Matrix',
        motherName: 'Reloaded',
        dateOfBirth: dayjs('1919-04-08').unix(),
        city: 'Delhi',
        addressLine1: 'Zion',
        addressLine2: 'Mainframe',
        addressLine3: 'Computer',
        pincode: `4000 m3`,
        miscInfo: '',
        birthCertificate: 'QmfNo67h6XGX162cwSSgBXVdxh6TqJDM42nrWxrCLYadMd',
        PAN: 'QmUF8Ehv5REwdJSE64Cp379vRhnVqH7yxUE67vhxUVmevT',
        DL: 'QmV5XciCpvSx51JjavfKj9PYp9dBsLAXGziSheh34qUDA9',
        ADHAAR: 'Qmbm8KEr6CnqUGv6wFsN6SPSx1bb4gz2reMfmwXHtjGPTz',
        passport: 'QmSYpE8cSn52n9N965n61DFPC3SPTRr8q5uiwaPSYAQqXb',
      },
    ];

    const artifact = await deployments.getArtifact('KnowYourCustomer');
    await deployments.save('KnowYourCustomer', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('KnowYourCustomer')),
      address: '',
    });

    for (const KnowYourCustomer of KnowYourCustomers) {
      await createKnowYourCustomer(KnowYourCustomer, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '21_deploy_kyc';
migrate.tags = ['KYC'];

async function createKnowYourCustomer(
  KnowYourCustomer: {
    Name: string;
    gender: string;
    firstName: string;
    middleName: string;
    lastName: string;
    fatherName: string;
    motherName: string;
    dateOfBirth: number;
    city: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    pincode: string;
    miscInfo: string;
    birthCertificate: string;
    PAN: string;
    DL: string;
    ADHAAR: string;
    passport: string;
  },
  deployer: string
) {
  const ipfsHash = await storeIpfsHash({
    gender: KnowYourCustomer.gender,
    firstName: KnowYourCustomer.firstName,
    middleName: KnowYourCustomer.middleName,
    lastName: KnowYourCustomer.lastName,
    fatherName: KnowYourCustomer.fatherName,
    motherName: KnowYourCustomer.motherName,
    dateOfBirth: KnowYourCustomer.dateOfBirth,
    city: KnowYourCustomer.city,
    addressLine1: KnowYourCustomer.addressLine1,
    addressLine2: KnowYourCustomer.addressLine2,
    addressLine3: KnowYourCustomer.addressLine3,
    pincode: KnowYourCustomer.pincode,
    miscInfo: KnowYourCustomer.miscInfo,
    birthCertificate: KnowYourCustomer.birthCertificate,
    PAN: KnowYourCustomer.PAN,
    DL: KnowYourCustomer.DL,
    ADHAAR: KnowYourCustomer.ADHAAR,
    passport: KnowYourCustomer.passport,
  });
  // await factory.create(KnowYourCustomer.Name, ipfsHash);
  await deployments.execute(
    'KnowYourCustomerFactory',
    { from: deployer, log: true },
    'create',
    KnowYourCustomer.Name,
    ipfsHash
  );
}
