import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  if (enabledFeatures.includes('SUPPLYCHAIN')) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
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
      'SupplyChainRegistry',
      'SupplyChainFactory',
      ['AdminRoleRegistry', 'BuyerRoleRegistry'],
      uiDefinitions,
      storeIpfsHash
    );

    const SupplyChains = [
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

    const artifact = await deployments.getArtifact('SupplyChain');
    await deployments.save('SupplyChain', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('SupplyChain')),
      address: '',
    });

    for (const SupplyChain of SupplyChains) {
     // await createSupplyChain(SupplyChain, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '16_deploy_supplychain';
migrate.tags = ['SupplyChain'];

async function createSupplyChain(
  SupplyChain: {
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
    Item_Name: SupplyChain.Item_Name,
    Quantity: SupplyChain.Quantity,
    Order_date: SupplyChain.Order_date,
    Price: SupplyChain.Price,
    Delivery_Duration: SupplyChain.Delivery_Duration,
    Delivery_Address: SupplyChain.Delivery_Address,
  });
  // await factory.create(SupplyChain.Order_Number, ipfsHash);
  await deployments.execute(
    'SupplyChainFactory',
    { from: deployer, log: true },
    'create',
    SupplyChain.Order_Number,
    ipfsHash
  );
}

