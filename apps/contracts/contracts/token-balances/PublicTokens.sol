pragma solidity 0.5.0;


contract PublicTokens {
    uint public tokenCount = 0;      //total count of all added tokens
    uint public tokenValidCount = 0; //count of all valid tokens isValid!=false
    address public owner;

    struct Token {
        bytes16 name;    // Name of the token
        bytes16 symbol;  // Symbol of the token
        address addr;    // Address of the token contract
        uint8 decimals;  // decimals of the token
        bytes32 website; // website of the token
        bytes32 email;   // support email of the token
        bool isValid;    // whether the token is valid or not
    }

    mapping(uint => Token) public pubTokens;
    mapping(address => bool) public moderator;
    mapping(address => uint) public idMap;

    modifier ownerOnly() {
        require(owner == msg.sender, "only owner");
        _;
    }

    modifier onlyMod() {
        require(owner == msg.sender || moderator[msg.sender] == true, "only moderator");
        _;
    }

    modifier onlyContract(address addr) {
        uint32 size;
        assembly {
            size := extcodesize(addr)
        }
        require(size > 0, "Not a contract");
        _;
    }

    modifier no_null(address addr) {
        require(addr != address(0), "invalid address");
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function addModerator(address addr) public ownerOnly {
        moderator[addr] = true;
    }

    function removeModerator(address addr) public ownerOnly {
        moderator[addr] = false;
    }

    function addSetToken(
        bytes16 name,
        bytes16 symbol,
        address addr,
        uint8 decimals,
        bytes32 website,
        bytes32 email
    ) public onlyMod no_null(addr) onlyContract(addr) {
        Token storage token = pubTokens[idMap[addr]];
        if (token.addr == address(0)) {
            tokenCount++;
            tokenValidCount++;
            token = pubTokens[tokenCount];
            idMap[addr] = tokenCount;
            token.isValid = true;
        }
        token.name = name;
        token.symbol = symbol;
        token.addr = addr;
        token.decimals = decimals;
        token.website = website;
        token.email = email;
    }

    function disableToken(address addr) public onlyMod no_null(addr) {
        Token storage token = pubTokens[idMap[addr]];
        if (token.addr == addr) {
            token.isValid = false;
            tokenValidCount--;
        }
    }

    function enableToken(address addr) public onlyMod no_null(addr) {
        Token storage token = pubTokens[idMap[addr]];
        if (token.addr == addr) {
            token.isValid = false;
            tokenValidCount++;
        }
    }

    function getToken(address addr) public view returns (
        bytes16,
        bytes16,
        address,
        uint8,
        bytes32,
        bytes32
    ) {
        Token memory token = pubTokens[idMap[addr]];
        return (
            token.name,
            token.symbol,
            token.addr,
            token.decimals,
            token.website,
            token.email
        );
    }

    function getTokenById(uint id) public view returns (
        bytes16,
        bytes16,
        address,
        uint8,
        bytes32,
        bytes32
    ) {
        Token memory token = pubTokens[id];
        return (
            token.name,
            token.symbol,
            token.addr,
            token.decimals,
            token.website,
            token.email
        );
    }
}
