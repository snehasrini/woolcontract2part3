import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  if (enabledFeatures.includes('SUPPLYFINANCE')) {
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/supplychain/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    await deployStateMachineSystem(
      [deployer],
      dGateKeeper,
      'SupplyChainFinanceRegistry',
      'SupplyChainFinanceFactory',
      ['AdminRoleRegistry', 'BuyerRoleRegistry'],
      uiDefinitions,
      storeIpfsHash
    );

    const SupplyChainFinances = [
      {
        Order_Number: '5YJXCAE45GFF00001',

        Item_Name: 'Car',
        Quantity: '425382',
        Order_date: 1558362520,
        Price: '55000',
        Delivery_Duration: '6 Months',
        Delivery_Address: 'Street 4, City Central',
      },
      {
        Order_Number: '5YJRE1A31A1P01234',

        Item_Name: 'Car',
        Quantity: '123054',
        Order_date: 1558062520,
        Price: '55000',
        Delivery_Duration: '8 Months',
        Delivery_Address: 'Street 5, City Square',
      },
    ];

    const artifact = await deployments.getArtifact('SupplyChainFinance');
    await deployments.save('SupplyChainFinance', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('SupplyChainFinance')),
      address: '',
    });

    for (const SupplyChainFinance of SupplyChainFinances) {
      await createSupplyChainFinance(SupplyChainFinance, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '17_deploy_supplychainfinance';
migrate.tags = ['SupplyChainFinance'];

async function createSupplyChainFinance(
  SupplyChainFinance: {
    Order_Number: string;

    Item_Name: string;
    Quantity: string;
    Order_date: number;
    Price: string;
    Delivery_Duration: string;
    Delivery_Address: string;
  },
  deployer: string
) {
  const ipfsHash = await storeIpfsHash({
    Item_Name: SupplyChainFinance.Item_Name,
    Quantity: SupplyChainFinance.Quantity,
    Order_date: SupplyChainFinance.Order_date,
    Price: SupplyChainFinance.Price,
    Delivery_Duration: SupplyChainFinance.Delivery_Duration,
    Delivery_Address: SupplyChainFinance.Delivery_Address,
  });
  // await factory.create(SupplyChainFinance.Order_Number, ipfsHash);
  await deployments.execute(
    'SupplyChainFinanceFactory',
    { from: deployer, log: true },
    'create',
    SupplyChainFinance.Order_Number,
    ipfsHash
  );
}
