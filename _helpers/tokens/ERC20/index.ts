import { createPermission } from '../../authentication/permissions';
import { deployments, getNamedAccounts } from 'hardhat';
import { deployERC20Factory } from './factory';
import { deployERC20Registry } from './registry';
import { deployIERC20Token, issueERC20Tokens } from './token';

export interface IERC20TokenSet {
  gatekeeper: any;
  registry: {
    contract: any;
    extraParams: any[];
  };
  factory: {
    contract: any;
    extraParams: any[];
  };
  token: {
    contract: any;
    instances: IERC20Token[];
  };
  roles?: string[];
}

export interface IERC20Token {
  name: string;
  decimals: number;
  extraParams: any[];
  issuance?: IERC20TokenIssuance[];
}

export interface IERC20TokenIssuance {
  recipientGroups: any[];
  amount: number;
}

export async function deployERC20TokenSystem(
  tokenSet: IERC20TokenSet,
  tokenSystemOwner: string,
  uiDefinitions: any,
  storeIpfsHash: (data: any) => Promise<string>
) {
  const registry: any = await deployERC20Registry(tokenSet, tokenSystemOwner);
  const factory: any = await deployERC20Factory(tokenSet, tokenSystemOwner, registry);
  const tokens: any[] = [];
  for (const tokenInstance of tokenSet.token.instances) {
    const token = await deployIERC20Token(tokenSet, tokenInstance, tokenSet.factory.contract);
    tokens.push(token);
    if (tokenInstance.issuance) {
      for (const tokenIssuance of tokenInstance.issuance) {
        await issueERC20Tokens(tokenInstance, tokenIssuance);
      }
    }
  }

  console.log('Creating permissions...');

  await createPermission(
    tokenSet.gatekeeper,
    factory,
    'UPDATE_UIFIELDDEFINITIONS_ROLE',
    tokenSystemOwner,
    tokenSystemOwner
  );

  const hash = await storeIpfsHash(uiDefinitions);
  // await factory.setUIFieldDefinitionsHash(hash);
  const { deployer } = await getNamedAccounts();
  await deployments.execute(
    tokenSet.factory.contract,
    {
      from: deployer,
      log: true,
    },
    'setUIFieldDefinitionsHash',
    hash
  );

  return {
    registry,
    factory,
    tokens,
  };
}
