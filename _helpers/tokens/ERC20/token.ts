import { deployments, getNamedAccounts } from 'hardhat';
import { IERC20Token, IERC20TokenIssuance, IERC20TokenSet } from './index';

export async function deployIERC20Token(tokenSet: IERC20TokenSet, tokenInstance: IERC20Token, factoryContract: any) {
  const { execute } = deployments;
  const { deployer } = await getNamedAccounts();
  const tx = await execute(
    factoryContract,
    {
      from: deployer,
      log: true,
    },
    'createToken',
    tokenInstance.name,
    tokenInstance.decimals,
    ...tokenInstance.extraParams
  );
  const newTokenAddress = tx.events?.find((event) => event.event === 'TokenCreated')?.args[0];
  if (!newTokenAddress) throw new Error(`Token address not found in TokenCreated event`);

  return tokenInstance.name;
}

export async function issueERC20Tokens(tokenInstance: IERC20Token, tokenIssuance: IERC20TokenIssuance) {
  console.log('Token issuance is disabled, use the UI to issue tokens');
  //   const web3 = new Web3();
  //   const { execute } = deployments;
  //   const { deployer } = await getNamedAccounts();
  //   for (const recipientGroups of tokenIssuance.recipientGroups) {
  //     const deployedRecipientGroup = await ethers.getContract(recipientGroups);
  //     await execute(
  //       tokenInstance.name,
  //       { from: deployer, log: true },
  //       'mintToRoleRegistry',
  //       deployedRecipientGroup.address,
  //       web3.utils
  //         .toBN(tokenIssuance.amount)
  //         .mul(web3.utils.toBN(10).pow(web3.utils.toBN(tokenInstance.decimals)))
  //         .toString()
  //     );
  //   }
}
