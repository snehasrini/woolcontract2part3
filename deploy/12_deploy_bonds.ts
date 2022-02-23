import dayjs from 'dayjs';
import faker from 'faker';
import { DeployFunction } from 'hardhat-deploy/types';
import { createPermission, grantPermission } from '../_helpers/authentication/permissions';
import { enabledFeatures, storeIpfsHash } from '../_helpers/util/global';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  if (enabledFeatures.includes('BONDS')) {
    const { deploy, execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const dGateKeeper = await deploy('GateKeeper', {
      from: deployer,
      args: [],
      log: true,
    });

    const dCurrencyRegistry = await deploy('CurrencyRegistry', {
      from: deployer,
      args: [dGateKeeper.address],
      log: true,
    });
    const currencyRegistry = await ethers.getContractAt('CurrencyRegistry', dCurrencyRegistry.address);

    const currencies: Array<{ value: string; label: string }> = [];

    const currencyLength = await currencyRegistry.getIndexLength();
    for (let i = 0; i < currencyLength.toNumber(); i++) {
      const currency = await currencyRegistry.getByIndex(i);
      currencies.push({ value: currency[1], label: currency[0] });
    }

    const dBondRegistry = await deploy('BondRegistry', {
      from: deployer,
      args: [dGateKeeper.address],
      log: true,
    });
    await createPermission(dGateKeeper, dBondRegistry, 'LIST_TOKEN_ROLE', deployer, deployer);

    const dBondFactory = await deploy('BondFactory', {
      from: deployer,
      args: [dBondRegistry.address, dGateKeeper.address],
      log: true,
    });

    await createPermission(dGateKeeper, dBondFactory, 'CREATE_TOKEN_ROLE', deployer, deployer);
    await grantPermission(dGateKeeper, dBondRegistry, 'LIST_TOKEN_ROLE', dBondFactory.address);
    await grantPermission(dGateKeeper, dGateKeeper, 'CREATE_PERMISSIONS_ROLE', dBondFactory.address);
    await createPermission(dGateKeeper, dBondFactory, 'UPDATE_UIFIELDDEFINITIONS_ROLE', deployer, deployer);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const uiDefinitions = require('../contracts/bonds/UIDefinitions.json');
    uiDefinitions.selectFields.parCurrency = currencies;
    const hash = await storeIpfsHash(uiDefinitions);
    await execute('BondFactory', { from: deployer, log: true }, 'setUIFieldDefinitionsHash', hash);

    const artifact = await deployments.getArtifact('Bond');
    await deployments.save('Bond', {
      ...artifact,
      ...(await deployments.getExtendedArtifact('Bond')),
      address: '',
    });

    for (let i = 0; i < 10; i++) {
      const name = faker.company.companyName();
      const decimals = 2;
      const duration = i % 2 ? 24 : 60;
      const period = i % 2 ? 6 : 12;
      const periodString = i % 2 ? 'SEMI' : 'ANN';
      const interest = parseInt(faker.finance.amount(1, 12, 0), 10);
      const issuanceDate = i < 5 ? dayjs().subtract(3, 'year').add(i, 'month') : dayjs().add(i, 'month');
      const ipfsHash = await storeIpfsHash({
        isin: faker.finance.iban(),
        issuer: name,
      });
      const bondName = `BOND ${interest}% ${issuanceDate.add(duration * 4, 'week').format('YY-MM-DD')} ${periodString}`;
      const tx = await execute(
        'BondFactory',
        { from: deployer, log: true },
        'createToken',
        bondName,
        10 ** decimals * (parseInt(faker.finance.amount(5, 100, 0), 10) * 100),
        currencies[0].value,
        duration,
        interest,
        period,
        decimals,
        ipfsHash
      );
      const bondAddress = tx.events?.find((event) => event.event === 'TokenCreated')?.args[0];
      if (!bondAddress) throw new Error('Bond address not found');

      // await bond.setIssuanceDate(issuanceDate.unix());
      // await execute(bondName, { from: deployer, log: true }, 'setIssuanceDate', issuanceDate.unix());
      // if (issuanceDate.isBefore(dayjs())) {
      //   // await bond.launch(issuanceDate.add(1, 'day').unix());
      //   await execute(bondName, { from: deployer, log: true }, 'launch', issuanceDate.add(1, 'day').unix());
      // }
      // // await bond.mint(deployer, 10 ** decimals * faker.datatype.number(1000));
      // await execute(
      //   bondName,
      //   { from: deployer, log: true },
      //   'mint',
      //   deployer,
      //   10 ** decimals * faker.datatype.number(1000)
      // );
    }
  }
  return true;
};

export default migrate;
migrate.id = '12_deploy_bonds';
migrate.tags = ['Bonds'];
