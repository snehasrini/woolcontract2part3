// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/provenance/statemachine/StateMachineFactory.sol";
import "./KnowYourCustomer.sol";
import "./KnowYourCustomerRegistry.sol";

/**
 * @title Factory contract for knowyourcustomer state machines
 */
contract KnowYourCustomerFactory is StateMachineFactory {
  constructor(GateKeeper gateKeeper, KnowYourCustomerRegistry registry) StateMachineFactory(gateKeeper, registry) {}

  /**
   * @notice Create new knowyourcustomer
   * @dev Factory method to create a new knowyourcustomer. Emits StateMachineCreated event.
   * @param name Customer Name

   * @param ipfsFieldContainerHash ipfs hash of knowyourcustomer metadata
   */
  function create(string memory name, string memory ipfsFieldContainerHash)
    public
    authWithCustomReason(CREATE_STATEMACHINE_ROLE, "Sender needs CREATE_STATEMACHINE_ROLE")
  {
    bytes memory memProof = bytes(name);
    require(memProof.length > 0, "A Name is required");

    KnowYourCustomer knowyourcustomer = new KnowYourCustomer(
      address(gateKeeper),
      name,
      ipfsFieldContainerHash,
      _uiFieldDefinitionsHash
    );

    // Give every role registry a single permission on the newly created expense.
    bytes32[] memory roles = knowyourcustomer.getRoles();
    for (uint256 i = 0; i < roles.length; i++) {
      gateKeeper.createPermission(
        gateKeeper.getRoleRegistryAddress(roles[i]),
        address(knowyourcustomer),
        roles[i],
        address(this)
      );
    }

    _registry.insert(address(knowyourcustomer));
    emit StateMachineCreated(address(knowyourcustomer));
  }
}
