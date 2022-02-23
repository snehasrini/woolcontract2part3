import faker from 'faker';
import { DeployFunction } from 'hardhat-deploy/types';
import Web3 from 'web3';
import { createMintAccounts, deployRoleRegistry, IMintUser } from '../_helpers/authentication/accounts';
import { grantPermission } from '../_helpers/authentication/permissions';
import { enabledFeatures, entethMiddleware } from '../_helpers/util/global';

const roleRegistries: Array<{
  registry: string;
  role: string;
  prefix: string;
  seed: string;
}> = [];

const found = (features: string[]) =>
  (enabledFeatures as string[]).some((feature: string) => features.includes(feature));

if (
  found([
    'LOANS',
    'SHARES',
    'CURRENCY',
    'LOYALTYPOINT',
    'IDENTITIES',
    'BONDS',
    'VEHICLE',
    'EXPENSE',
    'STATEFULBONDS',
    'BILLOFLADING',
    'KYC',
    'ARTPIECE',
  ])
) {
  roleRegistries.push({
    registry: 'UserRoleRegistry',
    role: 'ROLE_USER',
    prefix: 'user',
    seed: 'valve yard cement detect festival tragic annual dinner enforce gate sun near',
  });
}

if (found(['STATEFULBONDS'])) {
  roleRegistries.push(
    {
      registry: 'MakerRoleRegistry',
      role: 'ROLE_MAKER',
      prefix: 'maker',
      seed: 'stove water train uniform minute juice mirror kitten human garage chunk tomato',
    },
    {
      registry: 'CheckerRoleRegistry',
      role: 'ROLE_CHECKER',
      prefix: 'checker',
      seed: 'smile tomato cabin giraffe swallow school weapon expose tissue kitten they ribbon',
    }
  );
}

if (found(['BILLOFLADING'])) {
  roleRegistries.push(
    {
      registry: 'CaptainRoleRegistry',
      role: 'ROLE_CAPTAIN',
      prefix: 'captain',
      seed: 'spring profit rebuild kit river stove august tilt arrow crater rural tool',
    },
    {
      registry: 'CarrierRoleRegistry',
      role: 'ROLE_CARRIER',
      prefix: 'carrier',
      seed: 'force sniff virus side pilot eyebrow fragile auto scene party degree expire',
    },
    {
      registry: 'FreightForwarderRoleRegistry',
      role: 'ROLE_FREIGHT_FORWARDER',
      prefix: 'freightforwarder',
      seed: 'present sunset corn tower banner jump snow scrub style prize casual ball',
    }
  );
}

if (found(['DRUGPACKAGE', 'VEHICLE'])) {
  roleRegistries.push({
    registry: 'ManufacturerRoleRegistry',
    role: 'ROLE_MANUFACTURER',
    prefix: 'manufacturer',
    seed: 'infant transfer spatial warfare chief mandate ahead execute grit vessel domain clay',
  });
}

if (found(['DRUGPACKAGE'])) {
  roleRegistries.push(
    {
      registry: 'ResellerRoleRegistry',
      role: 'ROLE_RESELLER',
      prefix: 'reseller',
      seed: 'elder pass group bacon equal adapt fish birth search goose garage slush',
    },
    {
      registry: 'PharmacyRoleRegistry',
      role: 'ROLE_PHARMACY',
      prefix: 'pharmacy',
      seed: 'buzz truth attend treat spring sort unaware easily fiber half load wait',
    }
  );
}

if (found(['EXPENSES'])) {
  roleRegistries.push({
    registry: 'RevisorRoleRegistry',
    role: 'ROLE_REVISOR',
    prefix: 'revisor',
    seed: 'vibrant breeze axis dove diagram rescue surge ceiling day stool heart oak',
  });
}

if (found(['PLOTS'])) {
  roleRegistries.push(
    {
      registry: 'LandRegistrarRoleRegistry',
      role: 'ROLE_LAND_REGISTRAR',
      prefix: 'land_registrar',
      seed: 'adapt survey million real search bargain excuse magic lab convince drum control',
    },
    {
      registry: 'NotaryRoleRegistry',
      role: 'ROLE_NOTARY',
      prefix: 'notary',
      seed: 'bubble viable artefact lake copper sell tribe scale estate equal cube limb',
    }
  );
}

if (found(['ORDERS'])) {
  roleRegistries.push(
    {
      registry: 'BusinessUnitRoleRegistry',
      role: 'ROLE_BU',
      prefix: 'bu',
      seed: 'say radar original jungle camera position nominee assault pledge sure anger sample',
    },
    {
      registry: 'SupplierRoleRegistry',
      role: 'ROLE_SUPPLIER',
      prefix: 'supplier',
      seed: 'infant transfer spatial warfare chief mandate ahead execute grit vessel domain clay',
    },
    {
      registry: 'SSCRoleRegistry',
      role: 'ROLE_SSC',
      prefix: 'ssc',
      seed: 'elder pass group bacon equal adapt fish birth search goose garage slush',
    }
  );
}

if (found(['VEHICLE'])) {
  roleRegistries.push(
    {
      registry: 'AgentRoleRegistry',
      role: 'ROLE_AGENT',
      prefix: 'agent',
      seed: 'best parrot quantum thank initial toward remind broken recycle scrap deputy battle',
    },
    {
      registry: 'RegulatorRoleRegistry',
      role: 'ROLE_REGULATOR',
      prefix: 'regulator',
      seed: 'evil raven habit style film brand change winter upon toilet dignity burger',
    }
  );
}

if (found(['SUPPLYCHAIN', 'SUPPLYFINANCE'])) {
  roleRegistries.push(
    {
      registry: 'AdminRoleRegistry',
      role: 'ROLE_ADMIN',
      prefix: 'admin',
      seed: 'toilet cloud bone book poverty envelope carry trick enemy moon essay aspect',
    },

    {
      registry: 'ConglomerateRoleRegistry',
      role: 'ROLE_CONGLOMERATE',
      prefix: 'conglomerate',
      seed: 'stool quantum other holiday truly morning amazing equal warrior clump tired caught',
    },

    {
      registry: 'RetailerRoleRegistry',
      role: 'ROLE_RETAILER',
      prefix: 'retailer',
      seed: 'turn myself ritual ski target shove raccoon announce siren rug heavy street',
    },

    {
      registry: 'AWTARoleRegistry',
      role: 'ROLE_AWTA',
      prefix: 'AWTA',
      seed: 'long mechanic chicken illness ridge cricket raw biology palace corn genuine tiger',
    },

    {
      registry: 'AWEXRoleRegistry',
      role: 'ROLE_AWEX',
      prefix: 'AWEX',
      seed: 'will recall dragon monitor appear fly sorry marble project beach demand mail',
    },

    {
      registry: 'WholesalerRoleRegistry',
      role: 'ROLE_WHOLESALER',
      prefix: 'wholesaler',
      seed: 'believe copy wagon right invest design risk alter practice spice gather music',
    }
  );
}

if (found(['KYB', 'KYC'])) {
  roleRegistries.push(
    {
      registry: 'RequesterRoleRegistry',
      role: 'ROLE_REQUESTER',
      prefix: 'requester',
      seed: 'wrap bulb fold snap ready win announce swarm hidden enter innocent window',
    },

    {
      registry: 'ApproverRoleRegistry',
      role: 'ROLE_APPROVER',
      prefix: 'approver',
      seed: 'wise output protect whale dial trap frame gauge globe hazard pride pretty',
    }
  );
}

if (found(['BG'])) {
  roleRegistries.push(
    {
      registry: 'BeneficiaryRoleRegistry',
      role: 'ROLE_BENEFICIARY',
      prefix: 'beneficiary',
      seed: 'wrap bulb fold snap ready win announce swarm hidden enter innocent window',
    },

    {
      registry: 'ApplicantRoleRegistry',
      role: 'ROLE_APPLICANT',
      prefix: 'applicant',
      seed: 'wise output protect whale dial trap frame gauge globe hazard pride pretty',
    },

    {
      registry: 'BankRoleRegistry',
      role: 'ROLE_BANK',
      prefix: 'bank',
      seed: 'wrap bulb fold snap ready win announce swarm hidden enter innocent window',
    }
  );
}

const migrate: DeployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!deployer) {
    console.error(
      '\n\nERROR!\n\nThe node you are deploying to does not have access to a private key to sign this transaction. Add a Private Key in this application to solve this.\n\n'
    );
    process.exit(1);
  }

  const userData: IMintUser[] = [];
  let bipIndex = 0;

  const dGateKeeper = await deploy('GateKeeper', {
    from: deployer,
    args: [],
    log: true,
  });

  // Admin
  const dAdminRoleRegistry = await deployRoleRegistry('AdminRoleRegistry', dGateKeeper, deployer);

  const adminRoleRegistry = await ethers.getContractAt('AdminRoleRegistry', dAdminRoleRegistry.address);

  const hasRole = await adminRoleRegistry.hasRole(deployer, { from: deployer });

  if (!hasRole) {
    await execute('AdminRoleRegistry', { from: deployer, log: true }, 'designate', deployer);
  }
  const web3 = new Web3();

  // admin key
  const adminKeyAsBytes32 = web3.utils.fromAscii('ROLE_ADMIN');
  const adminZeroPaddedKey = web3.eth.abi.encodeParameter('bytes32', adminKeyAsBytes32);

  // add roleregistry to gatekeeper and roleregistrymap
  await execute(
    'GateKeeper',
    {
      from: deployer,
      log: true,
    },
    'addRoleRegistry',
    dAdminRoleRegistry.address
  );
  await execute(
    'GateKeeper',
    {
      from: deployer,
      log: true,
    },
    'setRoleRegistryAddress',
    adminZeroPaddedKey,
    dAdminRoleRegistry.address
  );

  // Give to role registry the permission to designate admin roles to others
  await grantPermission(dGateKeeper, dAdminRoleRegistry, 'DESIGNATE_ROLE', dAdminRoleRegistry.address);

  for (const roleRegistry of roleRegistries) {
    const dRoleRegistry = await deployRoleRegistry(
      roleRegistry.registry,
      dGateKeeper,
      deployer // only admin can do this
    );
    const amount = 2;
    for (let i = 0; i < amount; i++) {
      userData.push({
        mnemonic: roleRegistry.seed,
        bip39Path: `m/44'/60'/0'/0/${bipIndex++}`,
        username: `${roleRegistry.prefix}${i}@example.com`,
        firstname: faker.name.firstName(),
        lastname: `(${roleRegistry.role.replace('ROLE_', '').replace('_ROLE', '')})`,
        company: faker.company.companyName(),
        password: 'settlemint',
        role: 'USER',
        roleRegistry: roleRegistry.registry,
        hidden: process.env.DEMO_HIDE_DUMMY_USERS === 'TRUE',
      });
    }

    // create keys again
    const keyAsBytes32 = web3.utils.fromAscii(roleRegistry.role);
    const zeroPaddedKey = web3.eth.abi.encodeParameter('bytes32', keyAsBytes32);

    // add roleregistry to gatekeeper and roleregistrymap
    await execute(
      'GateKeeper',
      {
        from: deployer,
        log: true,
      },
      'addRoleRegistry',
      dRoleRegistry.address
    );
    await execute(
      'GateKeeper',
      {
        from: deployer,
        log: true,
      },
      'setRoleRegistryAddress',
      zeroPaddedKey,
      dRoleRegistry.address
    );
    // Give to role registry the permission to designate role registry roles to others
    await grantPermission(dGateKeeper, dRoleRegistry, 'DESIGNATE_ROLE', dRoleRegistry.address);
  }

  await createMintAccounts(
    {
      userData,
      mintHost: entethMiddleware,
    },
    deployments,
    deployer,
    ethers
  );
  return true;
};

export default migrate;

migrate.id = '01_deploy_roles';
migrate.tags = ['Roles'];
