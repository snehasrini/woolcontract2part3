import dayjs from 'dayjs';
import { Contract } from 'ethers';
import { deployments } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import Web3 from 'web3';
import { deployFiniteStateMachineSystem } from '../_helpers/provenance/statemachine';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, execute } = deployments;
  const web3 = new Web3();
  if (!deployer) {
    console.error(
      '\n\nERROR!\n\nThe node you are deploying to does not have access to a private key to sign this transaction. Add a Private Key in this application to solve this.\n\n'
    );
    process.exit(1);
  }
  if (enabledFeatures.includes('EXPENSES')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/expense/UIDefinitions.json');

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    const stateMachine = await deployFiniteStateMachineSystem(
      [deployer],
      dGateKeeper,
      'Expense',
      'ExpenseRegistry',
      ['AdminRoleRegistry', 'UserRoleRegistry'],
      uiDefinitions,
      [],
      storeIpfsHash
    );

    const dExpenseInstance = await ethers.getContractAt('Expense', stateMachine.address);
    const allRoles = await dExpenseInstance.allRoles({ from: deployer });

    for (const role of allRoles) {
      await execute(
        'GateKeeper',
        { from: deployer, log: true },
        'createPermission',
        deployer,
        dExpenseInstance.address,
        role,
        deployer
      );
    }

    const roleToRoleRegistries: { [key: string]: Contract } = {
      ROLE_ADMIN: await ethers.getContract('AdminRoleRegistry'),
      ROLE_USER: await ethers.getContract('UserRoleRegistry'),
      ROLE_REVISOR: await ethers.getContract('RevisorRoleRegistry'),
    };

    for (const role of Object.keys(roleToRoleRegistries)) {
      await execute(
        'GateKeeper',
        { from: deployer, log: true },
        'grantPermission',
        roleToRoleRegistries[role].address,
        dExpenseInstance.address,
        web3.eth.abi.encodeParameter('bytes32', web3.utils.fromAscii(role))
      );
    }

    const expenses = [
      {
        amount: '19829',
        proof: 'QmY9dQYk1Pm1ctcnoKCtpmFKNz6z9YpdhTqsLETEa44J1N',
        localCurrencyAmount: '129812',
        localCurrency: 'CFA',
        exchangeRate: '654.647808',
        resultAndActivity: 'R2_A1',
        category: 'running_costs',
        type: 'Meeting',
        country: 'BJ',
        settlement: 'cash',
        incomeGeneratingActivity: 'no',
        description: 'Appui alimentaire aux enfants de maman Marguerite',
        supplier: 'Gold Business Center',
        invoiceDate: dayjs('2019-03-12').unix(),
      },
    ];

    for (const expense of expenses) {
      await createExpense(expense, deployer, deployer);
    }
  }
  return true;
};

export default migrate;
migrate.id = '02_deploy_expenses';
migrate.tags = ['Expenses'];

async function createExpense(expenseData: IExpenseData, owner: string, deployer: string) {
  const ipfsHash = await storeIpfsHash({
    localCurrencyAmount: expenseData.localCurrencyAmount,
    localCurrency: expenseData.localCurrency,
    exchangeRate: expenseData.exchangeRate,
    resultAndActivity: expenseData.resultAndActivity,
    category: expenseData.category,
    country: expenseData.country,
    settlement: expenseData.settlement,
    incomeGeneratingActivity: expenseData.incomeGeneratingActivity,
    description: expenseData.description,
    supplier: expenseData.supplier,
    invoiceDate: expenseData.invoiceDate,
    type: expenseData.type,
  });

  await deployments.execute(
    'Expense',
    { from: deployer, log: true },
    'create',
    expenseData.amount,
    expenseData.proof,
    expenseData.settlement,
    ipfsHash,
    owner
  );
}

interface IExpenseData {
  amount: string;
  proof: string;
  localCurrencyAmount: string;
  localCurrency: string;
  exchangeRate: string;
  resultAndActivity: string;
  category: string;
  type?: string;
  country: string;
  settlement: string;
  incomeGeneratingActivity: string;
  description: string;
  supplier: string;
  invoiceDate: number;
}
