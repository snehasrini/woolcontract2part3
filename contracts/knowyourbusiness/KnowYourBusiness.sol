// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/authentication/Secured.sol";
import "../_library/provenance/statemachine/StateMachine.sol";
import "../_library/utility/metadata/IpfsFieldContainer.sol";
import "../_library/utility/metadata/FileFieldContainer.sol";
import "../_library/utility/conversions/Converter.sol";

/**
 * KnowYourBusiness

 *
 * @title State machine for KnowYourBusiness
 */
contract KnowYourBusiness is Converter, StateMachine, IpfsFieldContainer, FileFieldContainer {
  bytes32 public constant STATE_KYB_REQUESTED = "SUBMITTED";
  bytes32 public constant STATE_KYB_APPROVED = "APPROVED";

  bytes32 public constant ROLE_ADMIN = "ROLE_ADMIN";
  bytes32 public constant ROLE_REQUESTER = "ROLE_REQUESTER";
  bytes32 public constant ROLE_APPROVER = "ROLE_APPROVER";

  bytes32[] public _roles = [ROLE_ADMIN, ROLE_REQUESTER, ROLE_APPROVER];

  string public _uiFieldDefinitionsHash;
  string public _Name;

  constructor(
    address gateKeeper,
    string memory Name,
    string memory ipfsFieldContainerHash,
    string memory uiFieldDefinitionsHash
  ) Secured(gateKeeper) {
    _Name = Name;
    _ipfsFieldContainerHash = ipfsFieldContainerHash;
    _uiFieldDefinitionsHash = uiFieldDefinitionsHash;
    setupStateMachine();
  }

  /**
   * @notice Updates expense properties
   * @param Name It is the order Identification Number
   * @param ipfsFieldContainerHash ipfs hash of supplychainfinance metadata
   */
  function edit(string memory Name, string memory ipfsFieldContainerHash) public {
    _Name = Name;
    _ipfsFieldContainerHash = ipfsFieldContainerHash;
  }

  /**
   * @notice Returns a DID of the supplychainfinance
   * @dev Returns a unique DID (Decentralized Identifier) for the supplychainfinance.
   * @return string representing the DID of the supplychainfinance
   */
  function DID() public view returns (string memory) {
    return string(abi.encodePacked("did:demo:supplychainfinance:", _Name));
  }

  /**
   * @notice Returns all the roles for this contract
   * @return bytes32[] array of raw bytes representing the roles
   */
  function getRoles() public view returns (bytes32[] memory) {
    return _roles;
  }

  function setupStateMachine() internal override {
    //create all states

    createState(STATE_KYB_REQUESTED);
    createState(STATE_KYB_APPROVED);

    // add properties

    addNextStateForState(STATE_KYB_REQUESTED, STATE_KYB_APPROVED);
    addRoleForState(STATE_KYB_REQUESTED, ROLE_REQUESTER);
    addRoleForState(STATE_KYB_APPROVED, ROLE_APPROVER);
    addRoleForState(STATE_KYB_REQUESTED, ROLE_ADMIN);
    addRoleForState(STATE_KYB_APPROVED, ROLE_ADMIN);

    setInitialState(STATE_KYB_REQUESTED);
  }
}
