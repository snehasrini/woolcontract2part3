import { DeployResult } from 'hardhat-deploy/types';
import Web3 from 'web3';
import { deployments, getNamedAccounts } from 'hardhat';
import { Contract } from 'ethers';

const web3 = new Web3();
export async function createPermission(
  gateKeeper: any,
  securedContractInstance: Contract | DeployResult,
  permissionName: string,
  permissionManagerAddress: string,
  permissionRecipientAddress: string
) {
  const { execute } = deployments;
  const { deployer } = await getNamedAccounts();
  await execute(
    'GateKeeper',
    {
      from: deployer,
      log: true,
    },
    'createPermission',
    permissionRecipientAddress,
    securedContractInstance.address,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.fromAscii(permissionName)),
    permissionManagerAddress
  );
}

export async function grantPermission(
  gateKeeper: any,
  securedContractInstance: Contract | DeployResult,
  permissionName: string,
  permissionRecipientAddress: string
) {
  const { execute } = deployments;
  const { deployer } = await getNamedAccounts();
  await execute(
    'GateKeeper',
    {
      from: deployer,
      log: true,
    },
    'grantPermission',
    permissionRecipientAddress,
    securedContractInstance.address,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.fromAscii(permissionName))
  );
}
