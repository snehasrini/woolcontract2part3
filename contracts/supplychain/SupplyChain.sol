// SPDX-License-Identifier: MIT
// SettleMint.com

pragma solidity ^0.8.0;

import "../_library/authentication/Secured.sol";
import "../_library/provenance/statemachine/StateMachine.sol";
import "../_library/utility/metadata/IpfsFieldContainer.sol";
import "../_library/utility/metadata/FileFieldContainer.sol";
import "../_library/utility/conversions/Converter.sol";
//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/**
 * SupplyChain

 *
 * @title State machine for SupplyChain
 */
contract SupplyChain is Converter, StateMachine, IpfsFieldContainer, FileFieldContainer {

  //IERC20 private _token = IERC20(TokenAddress);

  bytes32 public constant WHOLESALE_ORDER_FULFILLED = "WHOLESALE_ORDER_FULFILLED";
  bytes32 public constant WOOL_TESTED = "WOOL_TESTED";
  bytes32 public constant WOOL_TEST_GRADE_FEEDBACK = "WOOL_TEST_GRADE_FEEDBACK";
  bytes32 public constant WOOL_GRADED = "WOOL_GRADED";
  bytes32 public constant RETAIL_ORDER_PLACED = "RETAIL_ORDER_PLACED";
  bytes32 public constant RETAIL_ORDER_UNFULFILLED = "RETAIL_ORDER_UNFULFILLED";
  bytes32 public constant RETAIL_ORDER_FULFILLED = "RETAIL_ORDER_FULFILLED";
  bytes32 public constant ORDER_CANCELLED = "ORDER_CANCELLED";

  bytes32 public constant ROLE_ADMIN = "ROLE_ADMIN";
  bytes32 public constant ROLE_CONGLOMERATE = "ROLE_CONGLOMERATE";
  bytes32 public constant ROLE_RETAILER = "ROLE_RETAILER";
  bytes32 public constant ROLE_AWTA = "ROLE_AWTA";
  bytes32 public constant ROLE_AWEX = "ROLE_AWEX";
  bytes32 public constant ROLE_WHOLESALER = "ROLE_WHOLESALER";

  bytes32[] public _roles = [ROLE_ADMIN, ROLE_WHOLESALER,ROLE_CONGLOMERATE, ROLE_RETAILER, ROLE_AWTA, ROLE_AWEX ];

  string public _uiFieldDefinitionsHash;
  string public _Order_Number;

  constructor(
    address gateKeeper,
    string memory Order_Number,
    string memory ipfsFieldContainerHash,
    string memory uiFieldDefinitionsHash
  ) Secured(gateKeeper) {
    _Order_Number = Order_Number;
    _ipfsFieldContainerHash = ipfsFieldContainerHash;
    _uiFieldDefinitionsHash = uiFieldDefinitionsHash;
    setupStateMachine();
  }

  /**
   * @notice Updates expense properties
   * @param Order_Number It is the order Identification Number
   * @param ipfsFieldContainerHash ipfs hash of supplychainfinance metadata
   */
  function edit(string memory Order_Number, string memory ipfsFieldContainerHash) public {
    _Order_Number = Order_Number;
    _ipfsFieldContainerHash = ipfsFieldContainerHash;
  }

  /**
   * @notice Returns a DID of the supplychainfinance
   * @dev Returns a unique DID (Decentralized Identifier) for the supplychainfinance.
   * @return string representing the DID of the supplychainfinance
   */
  function DID() public view returns (string memory) {
    return string(abi.encodePacked("did:demo:supplychainfinance:", _Order_Number));
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

    createState(WHOLESALE_ORDER_FULFILLED);
    createState(WOOL_TESTED);
    createState(WOOL_TEST_GRADE_FEEDBACK);
    createState(WOOL_GRADED);
    createState(RETAIL_ORDER_PLACED);
    createState(RETAIL_ORDER_UNFULFILLED);
    createState(RETAIL_ORDER_FULFILLED);

    // add properties

     addNextStateForState(WHOLESALE_ORDER_FULFILLED, WOOL_TESTED);
    addNextStateForState(WOOL_TESTED, WOOL_TEST_GRADE_FEEDBACK);

    addNextStateForState(WOOL_TEST_GRADE_FEEDBACK, ORDER_CANCELLED);
    addNextStateForState(WOOL_TEST_GRADE_FEEDBACK, RETAIL_ORDER_FULFILLED);
    addNextStateForState(WOOL_TESTED, WOOL_GRADED);
    addNextStateForState(WOOL_GRADED, RETAIL_ORDER_PLACED);
    addNextStateForState(RETAIL_ORDER_PLACED, RETAIL_ORDER_UNFULFILLED);
    addNextStateForState(RETAIL_ORDER_UNFULFILLED, WOOL_TESTED);
    addNextStateForState(RETAIL_ORDER_PLACED, RETAIL_ORDER_FULFILLED);

    addRoleForState(WHOLESALE_ORDER_FULFILLED, ROLE_WHOLESALER);
    addRoleForState(WOOL_TESTED, ROLE_AWTA);
    addRoleForState(WOOL_GRADED, ROLE_AWEX);
    addRoleForState(RETAIL_ORDER_PLACED, ROLE_RETAILER);
    addRoleForState(RETAIL_ORDER_UNFULFILLED, ROLE_RETAILER);
    //addRoleForState(WOOL_TEST_GRADE_FEEDBACK, ROLE_AWEX& ROLE_AWTA, adminAddress);
    addRoleForState(RETAIL_ORDER_FULFILLED, ROLE_RETAILER);
    setInitialState(WHOLESALE_ORDER_FULFILLED);
  }
}
