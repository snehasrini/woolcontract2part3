// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/authentication/RoleRegistry.sol";

contract LandRegistrarRoleRegistry is RoleRegistry {
  bytes32 public constant ROLE_LAND_REGISTRAR = "ROLE_LAND_REGISTRAR";

  constructor(address gatekeeper) RoleRegistry(gatekeeper) {}

  /**
   * @dev Returns the role
   * @return A bytes32 role
   */
  function role() public pure returns (bytes32) {
    return ROLE_LAND_REGISTRAR;
  }
}
