// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/provenance/statemachine/StateMachineFactory.sol";
import "./Traceability.sol";
import "./TraceabilityRegistry.sol";

/**
 * @title Factory contract for generic state machines
 */
contract TraceabilityFactory is StateMachineFactory {
  constructor(GateKeeper gateKeeper, TraceabilityRegistry registry) StateMachineFactory(gateKeeper, registry) {}

  /**
   * @notice Create new generic instance
   * @dev Factory method to create a new state machine. Emits StateMachineCreated event.
   * @param harvestDate the fharvest date of  the batch
   * @param ipfsFieldContainerHash ipfs hash of vehicle metadata
   */
  function create(uint256 harvestDate, string memory ipfsFieldContainerHash)
    public
    authWithCustomReason(CREATE_STATEMACHINE_ROLE, "Sender needs CREATE_STATEMACHINE_ROLE")
  {
    Traceability traceability = new Traceability(
      address(gateKeeper),
      harvestDate,
      ipfsFieldContainerHash,
      _uiFieldDefinitionsHash
    );

    // Give every role registry a single permission on the newly created expense.
    bytes32[] memory roles = traceability.getRoles();
    for (uint256 i = 0; i < 1; i++) {
      gateKeeper.createPermission(
        gateKeeper.getRoleRegistryAddress(roles[i]),
        address(traceability),
        roles[i],
        address(this)
      );
    }
    _registry.insert(address(traceability));
    emit StateMachineCreated(address(traceability));
  }
}
