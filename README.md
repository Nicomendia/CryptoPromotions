# CryptoPromotions
NFT Project on Blockchain

This project is a Smart Contract used for buying, selling and operating some features on a NFT of brand logo promotions. Using the [CryptoZombies](https://cryptozombies.io/en/course) template as reference.

## Install

First of all, you must have installed [NodeJS](https://nodejs.org/en/). Then:

1. Download this repository.
2. In the root directory, execute the `npm install` command in order to install the required dependencies.

## Use

Once dependencies are installed, you can execute the test file with the command:

> $ npx hardhat test test/CryptoPromos.js

## TODO

Change the way we access to the ERC721, start using OpenZeppelin contracts. We can use functions like:

1. _safeMint(...)
2. _burn(...)
3. _baseURI(...)
4. tokenURI(...)
5. And many more.

This way we can work on the image, description and other aspects of every NFT via json data files.
