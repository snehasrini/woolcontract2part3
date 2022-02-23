// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/authentication/RoleRegistry.sol";

/**
 * @title Lists all agents
 */
contract BuyerRoleRegistry is RoleRegistry {
  bytes32 public constant ROLE_BUYER = "ROLE_BUYER";

  constructor(address gatekeeper) RoleRegistry(gatekeeper) {}

  /**
   * @dev Returns the role
   * @return A bytes32 role
   */
  function role() public pure returns (bytes32) {
    return ROLE_BUYER;
  }
}
