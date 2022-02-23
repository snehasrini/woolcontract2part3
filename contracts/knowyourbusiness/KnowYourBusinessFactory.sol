// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/provenance/statemachine/StateMachineFactory.sol";
import "./KnowYourBusiness.sol";
import "./KnowYourBusinessRegistry.sol";

/**
 * @title Factory contract for knowyourbusiness state machines
 */
contract KnowYourBusinessFactory is StateMachineFactory {
  constructor(GateKeeper gateKeeper, KnowYourBusinessRegistry registry) StateMachineFactory(gateKeeper, registry) {}

  /**
   * @notice Create new knowyourbusiness
   * @dev Factory method to create a new knowyourbusiness. Emits StateMachineCreated event.
   * @param Name Business Name

   * @param ipfsFieldContainerHash ipfs hash of knowyourbusiness metadata
   */
  function create(string memory Name, string memory ipfsFieldContainerHash)
    public
    authWithCustomReason(CREATE_STATEMACHINE_ROLE, "Sender needs CREATE_STATEMACHINE_ROLE")
  {
    bytes memory memProof = bytes(Name);
    require(memProof.length > 0, "A Name is required");

    KnowYourBusiness knowyourbusiness = new KnowYourBusiness(
      address(gateKeeper),
      Name,
      ipfsFieldContainerHash,
      _uiFieldDefinitionsHash
    );

    // Give every role registry a single permission on the newly created expense.
    bytes32[] memory roles = knowyourbusiness.getRoles();
    for (uint256 i = 0; i < roles.length; i++) {
      gateKeeper.createPermission(
        gateKeeper.getRoleRegistryAddress(roles[i]),
        address(knowyourbusiness),
        roles[i],
        address(this)
      );
    }

    _registry.insert(address(knowyourbusiness));
    emit StateMachineCreated(address(knowyourbusiness));
  }
}
