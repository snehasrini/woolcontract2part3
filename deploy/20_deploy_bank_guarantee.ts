import dayjs from 'dayjs';
import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  if (enabledFeatures.includes('BG')) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/bankguarantee/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    await deployStateMachineSystem(
      [deployer],
      dGateKeeper,
      'BankGuaranteeRegistry',
      'BankGuaranteeFactory',
      ['AdminRoleRegistry', 'BankRoleRegistry', 'ApplicantRoleRegistry'],
      uiDefinitions,
      storeIpfsHash
    );

    const BankGuarantees = [
      {
        Name: 'BG-1',
        nameApplicant: 'Settlemint',
        nameBeneficiary: 'WB',
        nameIssuingBank: 'Indian Bank',
        amount: 10233,
        amountInWords: 'One zero two three three',
        currency: 'INR',
        dateIssuance: dayjs('2020-08-08').unix(),
        dateMaturity: dayjs('2020-08-08').unix(),
        dateExpiry: dayjs('2020-08-08').unix(),
        purpose: 'QmUF8Ehv5REwdJSE64Cp379vRhnVqH7yxUE67vhxUVmevT',
        jurisdiction: 'Delhi',
      },
    ];

    const artifact = await deployments.getArtifact('BankGuarantee');
    await deployments.save('BankGuarantee', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('BankGuarantee')),
      address: '',
    });

    for (const abankGuarantee of BankGuarantees) {
      await createBankGuarantee(abankGuarantee, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '20_deploy_bankguarantee';
migrate.tags = ['BankGuarantee'];

async function createBankGuarantee(
  BankGuarantee: {
    Name: string;
    nameApplicant: string;
    nameBeneficiary: string;
    nameIssuingBank: string;
    amount: number;
    amountInWords: string;
    currency: string;
    dateIssuance: number;
    dateMaturity: number;
    dateExpiry: number;
    purpose: string;
    jurisdiction: string;
  },
  deployer: string
) {
  const ipfsHash = await storeIpfsHash({
    nameApplicant: BankGuarantee.nameApplicant,
    nameBeneficiary: BankGuarantee.nameBeneficiary,
    nameIssuingBank: BankGuarantee.nameIssuingBank,
    amount: BankGuarantee.amount,
    amountInWords: BankGuarantee.amountInWords,
    currency: BankGuarantee.currency,
    dateIssuance: BankGuarantee.dateIssuance,
    dateMaturity: BankGuarantee.dateMaturity,
    dateExpiry: BankGuarantee.dateExpiry,
    purpose: BankGuarantee.purpose,
    jurisdiction: BankGuarantee.jurisdiction,
  });
  // await factory.create(BankGuarantee.Name, ipfsHash);
  await deployments.execute(
    'BankGuaranteeFactory',
    { from: deployer, log: true },
    'create',
    BankGuarantee.Name,
    ipfsHash
  );
}
