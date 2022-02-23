// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/tokens/ERC20/ERC20TokenRegistry.sol";

/**
 * @title Lists all deployed coins
 */
contract ShareRegistry is ERC20TokenRegistry {
  constructor(address gateKeeper) ERC20TokenRegistry(gateKeeper) {}
}
