// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/utility/upgrading/UpgradeableRegistry.sol";

/**
 * @title Registry contract for bill of lading state machines
 */
contract OrdersRegistry is UpgradeableRegistry {
  constructor(address gatekeeper) UpgradeableRegistry(gatekeeper) {}
}
