// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/provenance/statemachine/StateMachineFactory.sol";
import "./SupplyChainFinance.sol";
import "./SupplyChainFinanceRegistry.sol";

/**
 * @title Factory contract for supplychainfinance state machines
 */
contract SupplyChainFinanceFactory is StateMachineFactory {
  constructor(GateKeeper gateKeeper, SupplyChainFinanceRegistry registry) StateMachineFactory(gateKeeper, registry) {}

  /**
   * @notice Create new supplychainfinance
   * @dev Factory method to create a new supplychainfinance. Emits StateMachineCreated event.
   * @param Order_Number is unique SupplyChainFinance Identification Number
   * @param ipfsFieldContainerHash ipfs hash of supplychainfinance metadata
   */
  function create(string memory Order_Number, string memory ipfsFieldContainerHash)
    public
    authWithCustomReason(CREATE_STATEMACHINE_ROLE, "Sender needs CREATE_STATEMACHINE_ROLE")
  {
    bytes memory memProof = bytes(Order_Number);
    require(memProof.length > 0, "A Order_Number is required");

    SupplyChainFinance supplychainfinance = new SupplyChainFinance(
      address(gateKeeper),
      Order_Number,
      ipfsFieldContainerHash,
      _uiFieldDefinitionsHash
    );

    // Give every role registry a single permission on the newly created expense.
    bytes32[] memory roles = supplychainfinance.getRoles();
    for (uint256 i = 0; i < roles.length; i++) {
      gateKeeper.createPermission(
        gateKeeper.getRoleRegistryAddress(roles[i]),
        address(supplychainfinance),
        roles[i],
        address(this)
      );
    }

    _registry.insert(address(supplychainfinance));
    emit StateMachineCreated(address(supplychainfinance));
  }
}
