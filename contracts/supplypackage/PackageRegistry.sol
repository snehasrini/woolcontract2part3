// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/utility/upgrading/UpgradeableRegistry.sol";

/**
 * @title Registry contract for expense state machines
 */
contract PackageRegistry is UpgradeableRegistry {
  constructor(address gateKeeper) UpgradeableRegistry(gateKeeper) {}
}
