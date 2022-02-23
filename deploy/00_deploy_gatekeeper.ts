import { DeployFunction } from 'hardhat-deploy/types';

const migrate: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  if (!deployer) {
    console.error(
      '\n\nERROR!\n\nThe node you are deploying to does not have access to a private key to sign this transaction. Add a Private Key in this application to solve this.\n\n'
    );
    process.exit(1);
  }
  await deploy('GateKeeper', {
    from: deployer,
    args: [],
    log: true,
  });
  return true;
};

export default migrate;

migrate.id = '00_deploy_gatekeeper';
migrate.tags = ['GateKeeper'];
