import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployFiniteStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  if (enabledFeatures.includes('ORDERS')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/orders/UIDefinitions.json');

    const { deployer } = await getNamedAccounts();
    const { deploy, execute } = deployments;

    const gateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    const orders = await deployFiniteStateMachineSystem(
      [deployer],
      gateKeeper,
      'Orders',
      'OrdersRegistry',
      ['AdminRoleRegistry', 'BusinessUnitRoleRegistry'],
      uiDefinitions,
      [],
      storeIpfsHash
    );

    const dOrders = await ethers.getContractAt('Orders', orders.address);
    const allRoles = await dOrders.allRoles();

    for (const role of allRoles) {
      await execute(
        'GateKeeper',
        { from: deployer, log: true },
        'createPermission',
        deployer,
        orders.address,
        role,
        deployer
      );
    }

    const businessUnitRoleRegistry = await ethers.getContract('BusinessUnitRoleRegistry');
    const businessunits = await businessUnitRoleRegistry.getRoleHolders();

    const Orderss: IOrdersData[] = [
      {
        businessUnit: businessunits[0],
        InBoneChickenPerKg: 400,
        WokForTwoPerPackage: 200,
        FreeRangeChickenPerChicken: 34444,
        PastaSaladPerPackage: 10,
      },
      {
        businessUnit: businessunits[0],
        InBoneChickenPerKg: 40,
        WokForTwoPerPackage: 20,
        FreeRangeChickenPerChicken: 344,
        PastaSaladPerPackage: 1,
      },
      {
        businessUnit: businessunits[1],
        InBoneChickenPerKg: 0,
        WokForTwoPerPackage: 20000,
        FreeRangeChickenPerChicken: 344444,
        PastaSaladPerPackage: 1000,
      },
      {
        businessUnit: businessunits[0],
        InBoneChickenPerKg: 678,
        WokForTwoPerPackage: 901,
        FreeRangeChickenPerChicken: 2345,
        PastaSaladPerPackage: 6789,
      },
    ];

    for (const order of Orderss) {
      await createOrder(order, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '14_deploy_orders';
migrate.tags = ['Orders'];

async function createOrder(OrdersData: IOrdersData, deployer: string) {
  const ipfsHash = await storeIpfsHash({});
  return await deployments.execute(
    'Orders',
    { from: deployer, log: true },
    'create',
    OrdersData.businessUnit,
    OrdersData.InBoneChickenPerKg,
    OrdersData.WokForTwoPerPackage,
    OrdersData.FreeRangeChickenPerChicken,
    OrdersData.PastaSaladPerPackage,
    ipfsHash
  );
}

interface IOrdersData {
  FreeRangeChickenPerChicken: number;
  InBoneChickenPerKg: number;
  PastaSaladPerPackage: number;
  WokForTwoPerPackage: number;
  businessUnit: string;
}
