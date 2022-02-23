import axios from 'axios';
import { Wallet } from 'ethers';
import { DeploymentsExtension, DeployResult } from 'hardhat-deploy/types';
import _ from 'lodash';
import { deploy } from '../util/deploy';
import { ethers, deployments, getNamedAccounts } from 'hardhat';

import { createPermission } from './permissions';

export async function deployRoleRegistry(roleRegistry: string, gateKeeper: any, managerAddress: string) {
  const deployedRoleRegistry: DeployResult = await deploy(roleRegistry, [gateKeeper.address]);
  if (deployedRoleRegistry.newlyDeployed)
    await createPermission(gateKeeper, deployedRoleRegistry, 'DESIGNATE_ROLE', managerAddress, managerAddress);

  return deployedRoleRegistry;
}

export interface IMintUser {
  mnemonic: string;
  bip39Path: string;
  username: string;
  firstname: string;
  lastname: string;
  company?: string;
  password: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  roleRegistry: string;
  wallet?: Wallet;
  mintId?: string;
  hidden?: boolean;
}

async function createAccounts(blockchainAccounts: IMintUser[]) {
  const { deployer } = await getNamedAccounts();
  const walletsEnhancedUsers: IMintUser[] = [];
  for (const blockchainAccount of blockchainAccounts) {
    blockchainAccount.wallet = await createAccount(
      blockchainAccount.roleRegistry,
      blockchainAccount.mnemonic,
      blockchainAccount.bip39Path,
      deployer
    );
    walletsEnhancedUsers.push(blockchainAccount);
  }

  return walletsEnhancedUsers;
}

async function createAccount(roleRegistry: any, mnemonic: string, bip39Path: string, deployer: string) {
  const wallet = Wallet.fromMnemonic(mnemonic, bip39Path);
  const dRegistry = await ethers.getContract(roleRegistry);
  const hasRole = await dRegistry.hasRole(await wallet.getAddress());
  if (!hasRole) {
    const address = await wallet.getAddress();
    await deployments.execute(roleRegistry, { from: deployer, log: true }, 'designate', address);
  }

  return wallet;
}

async function registerAccountsInMint(walletsEnhancedUsers: IMintUser[], mintHost: string) {
  const mintEnhancedUsers: IMintUser[] = [];
  for (const walletsEnhancedUser of walletsEnhancedUsers) {
    const mintEnhancedUser = await registerAccountInMint(walletsEnhancedUser, mintHost);
    if (mintEnhancedUser) {
      mintEnhancedUsers.push(mintEnhancedUser);
    } else {
      mintEnhancedUsers.push(walletsEnhancedUser);
    }
  }

  return mintEnhancedUsers;
}

async function registerAccountInMint(walletsEnhancedUser: IMintUser, mintHost: string) {
  const postData = {
    username: walletsEnhancedUser.username,
    firstname: walletsEnhancedUser.firstname,
    lastname: walletsEnhancedUser.lastname,
    meta: {
      company: walletsEnhancedUser.company,
    },
    password: walletsEnhancedUser.password,
    role: walletsEnhancedUser.role,
    wallets: {
      ethereum: {
        privateKey: walletsEnhancedUser.wallet?.privateKey,
      },
    },
    hidden: walletsEnhancedUser.hidden,
  };
  try {
    const result = await axios({
      method: 'post',
      url: `${mintHost}/dapi/v1/users`,
      data: postData,
    });

    walletsEnhancedUser.mintId = result.data.id;

    return walletsEnhancedUser;
  } catch (error: any) {
    if (_.get(error, 'response.data.statusCode') !== 409 && !(error.message as string).includes('ECONNREFUSED')) {
      console.error(`Creating account on ${mintHost} failed:`, error.message);
      if (error.config) {
        console.error(`Endpoint:`, error.config.url);
        console.error(`Payload:`, error.config.data);
      }
      if (error.response) {
        console.error(`Response:`, error.response.data);
      }
    } else {
      console.error(`Creating account on ${mintHost} was skipped because the user already exists or: ${error}`);
    }

    return false;
  }
}

export async function createMintAccounts(
  config: { userData: IMintUser[]; mintHost: string },
  deployments: DeploymentsExtension,
  deployer: string,
  ethers: any
) {
  // Create all the wallets
  const walletsEnhancedUsers = await createAccounts(config.userData);

  if (!process.env.NO_MINT_CALLS) {
    // Register the users in Mint, if a user already exists, skip gracefully user.
    const mintEnhancedUsers = await registerAccountsInMint(walletsEnhancedUsers, config.mintHost);

    return mintEnhancedUsers;
  }

  return walletsEnhancedUsers;
}
