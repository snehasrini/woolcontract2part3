import { deployments, getNamedAccounts } from 'hardhat';

export async function deploy(contract: string, params: any[]) {
  const { deployer } = await getNamedAccounts();
  if (!deployer) throw new Error('deployer is required');
  else {
    const { deploy: deployHH } = deployments;
    const result = await deployHH(contract, {
      from: deployer,
      args: params,
      log: true,
      contract: contract,
    });
    return result;
  }
}
