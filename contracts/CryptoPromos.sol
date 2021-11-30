pragma solidity >=0.5.0 <0.6.0;

import "./ownable.sol";
import "./safemath.sol";
import "./erc721.sol";

contract CryptoPromos is Ownable, ERC721 {

  using SafeMath for uint256;
  
  uint createFee = 0.001 ether;
  uint editFee = 0.001 ether;
  uint transferFee = 0.001 ether;

  event NewPromo(uint promoId, string urlLogo, string link, string message);
  event EditPromo(uint promoId, string urlLogo, string link, string message);

  struct Promo {
    string urlLogo;
	string link;
	string message;
  }

  Promo[] public promos;

  mapping (uint => address) public promoToOwner;
  mapping (address => uint) ownerPromoCount;
  mapping (uint => address) promoApprovals;
  
  modifier onlyOwnerOf(uint _promoId) {
    require(msg.sender == promoToOwner[_promoId]);
    _;
  }

  function createPromo(string memory _urlLogo, string memory _link, string memory _message) public payable {
    require(msg.value == createFee);
	uint id = promos.push(Promo(_urlLogo, _link, _message)) - 1;
    promoToOwner[id] = msg.sender;
    ownerPromoCount[msg.sender] = ownerPromoCount[msg.sender].add(1);
    emit NewPromo(id, _urlLogo, _link, _message);
  }
  
  function editPromo(uint _promoId, string memory _urlLogo, string memory _link, string memory _message) public payable onlyOwnerOf(_promoId) {
	require(msg.value == editFee);
	Promo storage myPromo = promos[_promoId];
	myPromo.urlLogo = _urlLogo;
	myPromo.link = _link;
	myPromo.message = _message;
	emit EditPromo(_promoId, myPromo.urlLogo, myPromo.link, myPromo.message);
  }
  
  function getPromosByOwner(address _owner) external view returns(uint[] memory) {
    uint[] memory result = new uint[](ownerPromoCount[_owner]);
    uint counter = 0;
    for (uint i = 0; i < promos.length; i++) {
      if (promoToOwner[i] == _owner) {
        result[counter] = i;
        counter++;
      }
    }
    return result;
  }
  
  function withdraw() external onlyOwner {
    address payable _owner = address(uint160(owner()));
    _owner.transfer(address(this).balance);
  }
  
  function setCreateFee(uint _fee) external onlyOwner {
    createFee = _fee;
  }
  
  function setEditFee(uint _fee) external onlyOwner {
    editFee = _fee;
  }
  
  function setTransferFee(uint _fee) external onlyOwner {
    transferFee = _fee;
  }
  
  function balanceOf(address _owner) external view returns (uint256) {
    return ownerPromoCount[_owner];
  }
  
  function ownerOf(uint256 _tokenId) external view returns (address) {
    return promoToOwner[_tokenId];
  }
  
  function _transfer(address _from, address _to, uint256 _tokenId) private {
    require(msg.value == transferFee);
	ownerPromoCount[_to] = ownerPromoCount[_to].add(1);
    ownerPromoCount[msg.sender] = ownerPromoCount[msg.sender].sub(1);
    promoToOwner[_tokenId] = _to;
    emit Transfer(_from, _to, _tokenId);
  }
  
  function transferFrom(address _from, address _to, uint256 _tokenId) external payable {
	require (promoToOwner[_tokenId] == msg.sender || promoApprovals[_tokenId] == msg.sender);
	_transfer(_from, _to, _tokenId);
  }
  
  function approve(address _approved, uint256 _tokenId) external payable onlyOwnerOf(_tokenId) {
	promoApprovals[_tokenId] = _approved;
	emit Approval(msg.sender, _approved, _tokenId);
  }
}
