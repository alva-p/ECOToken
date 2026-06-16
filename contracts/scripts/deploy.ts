import { ethers, upgrades } from 'hardhat';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Deploy del proxy UUPS de ECOToken en Sepolia y registro de la dirección + ABI
 * en deployments/sepolia.json (consumido por backend y frontend).
 *
 * STUB inicial (Sprint 0).
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const admin = process.env.ADMIN_ADDRESS ?? deployer.address;

  const ECOToken = await ethers.getContractFactory('ECOToken');
  const proxy = await upgrades.deployProxy(ECOToken, [admin], {
    kind: 'uups',
    initializer: 'initialize',
  });
  await proxy.waitForDeployment();

  const address = await proxy.getAddress();
  console.log(`ECOToken (proxy UUPS) desplegado en: ${address}`);

  const out = { network: 'sepolia', address, admin, deployedBy: deployer.address };
  mkdirSync(join(__dirname, '../deployments'), { recursive: true });
  writeFileSync(
    join(__dirname, '../deployments/sepolia.json'),
    JSON.stringify(out, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
