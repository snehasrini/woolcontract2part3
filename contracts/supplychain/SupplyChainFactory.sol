// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/provenance/statemachine/StateMachineFactory.sol";
import "./SupplyChain.sol";
import "./SupplyChainRegistry.sol";

/**
 * @title Factory contract for supplychain state machines
 */
contract SupplyChainFactory is StateMachineFactory {
  constructor(GateKeeper gateKeeper, SupplyChainRegistry registry) StateMachineFactory(gateKeeper, registry) {}

  /**
   * @notice Create new supplychain
   * @dev Factory method to create a new supplychain. Emits StateMachineCreated event.
   * @param Order_Number Unique Identification Number

   * @param ipfsFieldContainerHash ipfs hash of supplychain metadata
   */
  function create(string memory Order_Number, string memory ipfsFieldContainerHash)
    public
    authWithCustomReason(CREATE_STATEMACHINE_ROLE, "Sender needs CREATE_STATEMACHINE_ROLE")
  {
    bytes memory memProof = bytes(Order_Number);
    require(memProof.length > 0, "A Order_Number is required");

    SupplyChain supplychain = new SupplyChain(
      address(gateKeeper),
      Order_Number,
      ipfsFieldContainerHash,
      _uiFieldDefinitionsHash
    );

    // Give every role registry a single permission on the newly created expense.
    bytes32[] memory roles = supplychain.getRoles();
    for (uint256 i = 0; i < roles.length; i++) {
      gateKeeper.createPermission(
        gateKeeper.getRoleRegistryAddress(roles[i]),
        address(supplychain),
        roles[i],
        address(this)
      );
    }

    _registry.insert(address(supplychain));
    emit StateMachineCreated(address(supplychain));
  }
}
