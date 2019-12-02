pragma solidity ^0.4.23;

contract Company {
    struct Manager {
        address managerAddress;
        bytes32 name;
        uint date;
    }

    mapping (uint => Manager) public managerInfo;
    address public owner;
    address[4] public managers;

    event LogCheckCompany(
        address _manager,
        uint _id,
        uint _date
    );

    constructor() public {
        owner = msg.sender;
    }

    function checkCompany(uint _id, bytes32 _name,  uint _date) public payable {
        require(_id >= 0 && _id <= 3);
        managers[_id] = msg.sender;
        managerInfo[_id] = Manager(msg.sender, _name, _date);

        owner.transfer(msg.value);
        emit LogCheckCompany(msg.sender, _id, _date);
    }

    function getManagerInfo(uint _id) public view returns (address, bytes32,uint) {
        Manager memory manager = managerInfo[_id];
        return (manager.managerAddress, manager.name, manager.date);
    }

    function getAllManagers() public view returns (address[4]) {
        return managers;
    }
}
