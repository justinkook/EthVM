pragma solidity ^0.5.0;


contract DummyContract {
    constructor() public {
    }

    function add(uint a, uint b) public pure returns (uint) {
        return a+b;
    }
}
