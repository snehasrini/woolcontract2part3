import dayjs from 'dayjs';
import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployFiniteStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, execute } = deployments;
  if (!deployer) {
    console.error(
      '\n\nERROR!\n\nThe node you are deploying to does not have access to a private key to sign this transaction. Add a Private Key in this application to solve this.\n\n'
    );
    process.exit(1);
  }
  if (enabledFeatures.includes('BILLOFLADING')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/billoflading/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    const stateMachine = await deployFiniteStateMachineSystem(
      [deployer],
      dGateKeeper,
      'BillOfLading',
      'BillOfLadingRegistry',
      ['AdminRoleRegistry', 'UserRoleRegistry'],
      uiDefinitions,
      [],
      storeIpfsHash
    );

    const dBillOfLadingInstance = await ethers.getContractAt('BillOfLading', stateMachine.address);

    const allRoles = await dBillOfLadingInstance.allRoles();
    for (const role of allRoles) {
      await execute(
        'GateKeeper',
        { from: deployer, log: true },
        'createPermission',
        deployer,
        dBillOfLadingInstance.address,
        role,
        deployer
      );
    }

    const billofladings = [
      {
        typeOfBill: 'straight',
        from: 'Wilmar International Ltd',
        to: 'Cargill',
        carrier: '0xe1a42ac93ac8f449c0b4191770e9ce521a999bad',
        portOfOrigin: 'Singapore',
        portOfDestination: 'Antwerp',
        dateOfLoading: dayjs('2019-06-24').unix(),
        typeOfGoods: 'bulk',
        valueOfGoods: '3000000 SDG',
        countOfGoods: `20`,
        weightOfGoods: `34000 kg`,
        sizeOfGoods: `4000 m3`,
        specialConditions: '',
        commercialInvoice: 'QmfNo67h6XGX162cwSSgBXVdxh6TqJDM42nrWxrCLYadMd',
        packagingList: 'QmUF8Ehv5REwdJSE64Cp379vRhnVqH7yxUE67vhxUVmevT',
        certificateOfOrigin: 'QmV5XciCpvSx51JjavfKj9PYp9dBsLAXGziSheh34qUDA9',
        letterOfInstruction: 'Qmbm8KEr6CnqUGv6wFsN6SPSx1bb4gz2reMfmwXHtjGPTz',
        dangerousGoodsForm: 'QmSYpE8cSn52n9N965n61DFPC3SPTRr8q5uiwaPSYAQqXb',
      },
    ];

    for (const billoflading of billofladings) {
      await createBillOfLading(billoflading, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '10_deploy_billoflading';
migrate.tags = ['BillOfLading'];

async function createBillOfLading(billofladingData: IBillOfLadingData, deployer: string) {
  const ipfsHash = await storeIpfsHash(billofladingData); // warning, this only works because there are no fields not part of the ipfs data
  await deployments.execute('BillOfLading', { from: deployer, log: true }, 'create', ipfsHash);
}

interface IBillOfLadingData {
  typeOfBill: string;
  from: string;
  to: string;
  carrier: string;
  portOfOrigin: string;
  portOfDestination: string;
  dateOfLoading: number;
  typeOfGoods: string;
  valueOfGoods: string;
  countOfGoods: string;
  weightOfGoods: string;
  sizeOfGoods: string;
  specialConditions: string;
  commercialInvoice: string;
  packagingList: string;
  certificateOfOrigin: string;
  letterOfInstruction: string;
  dangerousGoodsForm: string;
}
