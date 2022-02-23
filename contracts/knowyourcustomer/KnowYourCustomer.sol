// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/authentication/Secured.sol";
import "../_library/provenance/statemachine/StateMachine.sol";
import "../_library/utility/metadata/IpfsFieldContainer.sol";
import "../_library/utility/metadata/FileFieldContainer.sol";
import "../_library/utility/conversions/Converter.sol";

/**
 * KnowYourCustomer

 *
 * @title State machine for KnowYourCustomer
 */
contract KnowYourCustomer is Converter, StateMachine, IpfsFieldContainer, FileFieldContainer {
  bytes32 public constant STATE_CREATED = "CREATED";
  bytes32 private constant STATE_IN_REVIEW = "IN_REVIEW";
  bytes32 private constant STATE_INCOMPLETE = "INCOMPLETE";
  bytes32 private constant STATE_EXCEPTION_GRANTED = "EXCEPTION_GRANTED";
  bytes32 public constant STATE_APPROVED = "APPROVED";
  bytes32 public constant ROLE_ADMIN = "ROLE_ADMIN";
  bytes32 public constant ROLE_REQUESTER = "ROLE_REQUESTER";
  bytes32 public constant ROLE_APPROVER = "ROLE_APPROVER";

  bytes32[] public _roles = [ROLE_ADMIN, ROLE_REQUESTER, ROLE_APPROVER];
  bytes32[] private _canEdit = [ROLE_ADMIN, ROLE_REQUESTER];

  string public _uiFieldDefinitionsHash;
  string public _Name;

  constructor(
    address gateKeeper,
    string memory name,
    string memory ipfsFieldContainerHash,
    string memory uiFieldDefinitionsHash
  ) Secured(gateKeeper) {
    _Name = name;
    _ipfsFieldContainerHash = ipfsFieldContainerHash;
    _uiFieldDefinitionsHash = uiFieldDefinitionsHash;
    setupStateMachine();
  }

  function canEdit() public view returns (bytes32[] memory) {
    return _canEdit;
  }

  /**
   * @notice Updates expense properties
   * @param name It is the order Identification Number
   * @param ipfsFieldContainerHash ipfs hash of knowyourcustomer metadata
   */
  function edit(string memory name, string memory ipfsFieldContainerHash) public {
    _Name = name;
    _ipfsFieldContainerHash = ipfsFieldContainerHash;
  }

  /**
   * @notice Returns a DID of the knowyourcustomer
   * @dev Returns a unique DID (Decentralized Identifier) for the knowyourcustomer.
   * @return string representing the DID of the knowyourcustomer
   */
  function DID() public view returns (string memory) {
    return string(abi.encodePacked("did:demo:knowyourcustomer:", _Name));
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
    createState(STATE_CREATED);
    createState(STATE_IN_REVIEW);
    createState(STATE_INCOMPLETE);
    createState(STATE_EXCEPTION_GRANTED);
    createState(STATE_APPROVED);

    // add properties

    addNextStateForState(STATE_CREATED, STATE_IN_REVIEW);
    addAllowedFunctionForState(STATE_CREATED, this.edit.selector);

    addNextStateForState(STATE_IN_REVIEW, STATE_INCOMPLETE);
    addNextStateForState(STATE_IN_REVIEW, STATE_APPROVED);
    addNextStateForState(STATE_INCOMPLETE, STATE_IN_REVIEW);
    addNextStateForState(STATE_INCOMPLETE, STATE_EXCEPTION_GRANTED);

    addNextStateForState(STATE_EXCEPTION_GRANTED, STATE_APPROVED);

    addRoleForState(STATE_CREATED, ROLE_REQUESTER);
    addRoleForState(STATE_IN_REVIEW, ROLE_REQUESTER);

    addRoleForState(STATE_INCOMPLETE, ROLE_APPROVER);
    addRoleForState(STATE_EXCEPTION_GRANTED, ROLE_APPROVER);
    addRoleForState(STATE_APPROVED, ROLE_APPROVER);

    //addRoleForState(STATE_CREATED,ROLE_ADMIN);
    //addRoleForState(STATE_IN_REVIEW,ROLE_ADMIN);
    //addRoleForState(STATE_INCOMPLETE,ROLE_ADMIN);
    //addRoleForState(STATE_EXCEPTION_GRANTED,ROLE_ADMIN);
    //addRoleForState(STATE_APPROVED,ROLE_ADMIN);
    setInitialState(STATE_CREATED);
  }
}
