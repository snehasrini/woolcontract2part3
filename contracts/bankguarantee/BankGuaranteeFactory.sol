// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/provenance/statemachine/StateMachineFactory.sol";
import "./BankGuarantee.sol";
import "./BankGuaranteeRegistry.sol";

/**
 * @title Factory contract for bankguarantee state machines
 */
contract BankGuaranteeFactory is StateMachineFactory {
  constructor(GateKeeper gateKeeper, BankGuaranteeRegistry registry) StateMachineFactory(gateKeeper, registry) {}

  /**
   * @notice Create new bankguarantee
   * @dev Factory method to create a new bankguarantee. Emits StateMachineCreated event.
   * @param Name Customer Name

   * @param ipfsFieldContainerHash ipfs hash of bankguarantee metadata
   */
  function create(string memory Name, string memory ipfsFieldContainerHash)
    public
    authWithCustomReason(CREATE_STATEMACHINE_ROLE, "Sender needs CREATE_STATEMACHINE_ROLE")
  {
    bytes memory memProof = bytes(Name);
    require(memProof.length > 0, "A Name is required");

    BankGuarantee bankguarantee = new BankGuarantee(
      address(gateKeeper),
      Name,
      ipfsFieldContainerHash,
      _uiFieldDefinitionsHash
    );

    // Give every role registry a single permission on the newly created expense.
    bytes32[] memory roles = bankguarantee.getRoles();
    for (uint256 i = 0; i < roles.length; i++) {
      gateKeeper.createPermission(
        gateKeeper.getRoleRegistryAddress(roles[i]),
        address(bankguarantee),
        roles[i],
        address(this)
      );
    }

    _registry.insert(address(bankguarantee));
    emit StateMachineCreated(address(bankguarantee));
  }
}
