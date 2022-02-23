// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/authentication/RoleRegistry.sol";

/**
 * @title Lists all carriers
 */
contract FreightForwarderRoleRegistry is RoleRegistry {
  bytes32 public constant ROLE_FREIGHT_FORWARDER = "ROLE_FREIGHT_FORWARDER";

  constructor(address gatekeeper) RoleRegistry(gatekeeper) {}

  /**
   * @dev Returns the role
   * @return A bytes32 role
   */
  function role() public pure returns (bytes32) {
    return ROLE_FREIGHT_FORWARDER;
  }
}
