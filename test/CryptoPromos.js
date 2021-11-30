const CryptoPromos = artifacts.require("CryptoPromos");
const utils = require("./helpers/utils");
const time = require("./helpers/time");
//var expect = require('chai').expect;

const PromoLogos = ["http://server/logo1.png", "http://server/logo2.png"];
const PromoLinks = ["http://server1.com", "http://server2.com"];
const PromoMessages = ["Sending BTC to multiple recipients have never been easier", "Buy and sell everything with us!"];

//TODO: separate in three different fees: createFee, editFee, transferFee
const fee = 1000000000000000;

contract("CryptoPromos", (accounts) => {
    let [deployer, alice, bob] = accounts;
	let contractInstance;
    beforeEach(async () => {
        contractInstance = await CryptoPromos.new();
    });
    it("should be able to create a new promo", async () => {
        const result = await contractInstance.createPromo(PromoLogos[0], PromoLinks[0], PromoMessages[0], {from: alice, value: fee});
		
        expect(result.receipt.status).to.equal(true);
		expect(result.logs[0].args.urlLogo).to.equal(PromoLogos[0]);
		expect(result.logs[0].args.link).to.equal(PromoLinks[0]);
		expect(result.logs[0].args.message).to.equal(PromoMessages[0]);
    })
	it("should be able to edit a promo", async () => {
        const result = await contractInstance.createPromo(PromoLogos[0], PromoLinks[0], PromoMessages[0], {from: alice, value: fee});
		const promoId = result.logs[0].args.promoId.toNumber();
		const resultEdit = await contractInstance.editPromo(promoId, PromoLogos[1], PromoLinks[1], PromoMessages[1], {from: alice, value: fee});
		
        expect(result.receipt.status).to.equal(true);
		expect(resultEdit.logs[0].args.urlLogo).to.equal(PromoLogos[1]);
		expect(resultEdit.logs[0].args.link).to.equal(PromoLinks[1]);
		expect(resultEdit.logs[0].args.message).to.equal(PromoMessages[1]);
    })
	it("should not be able to edit a promo by a different owner", async () => {
        const result = await contractInstance.createPromo(PromoLogos[0], PromoLinks[0], PromoMessages[0], {from: alice, value: fee});
		const promoId = result.logs[0].args.promoId.toNumber();
		await utils.shouldThrow(contractInstance.editPromo(promoId, PromoLogos[1], PromoLinks[1], PromoMessages[1], {from: bob, value: fee}));
    })
	it("should not be able to create a promo paying less than the fee", async () => {
		await utils.shouldThrow(contractInstance.createPromo(PromoLogos[0], PromoLinks[0], PromoMessages[0], {from: alice, value: fee-1}));
    })
	it("should not be able to create a promo paying more than the fee", async () => {
		await utils.shouldThrow(contractInstance.createPromo(PromoLogos[0], PromoLinks[0], PromoMessages[0], {from: alice, value: fee+1}));
    })
	it("Deployer should be able to withdraw funds", async () => {
        await contractInstance.withdraw({from: deployer});
    })
	it("Other users should not be able to withdraw funds", async () => {
		await utils.shouldThrow(contractInstance.withdraw({from: alice}));
    })

	context("with the single-step transfer scenario", async () => {
        it("should transfer a promo", async () => {
            const result = await contractInstance.createPromo(PromoLogos[0], PromoLinks[0], PromoMessages[0], {from: alice, value: fee});
            const promoId = result.logs[0].args.promoId.toNumber();
            await contractInstance.transferFrom(alice, bob, promoId, {from: alice, value: fee});
            const newOwner = await contractInstance.ownerOf(promoId);
            expect(newOwner).to.equal(bob);
        })
    })
    context("with the two-step transfer scenario", async () => {
        it("should approve and then transfer a promo when the approved address calls transferFrom", async () => {
            const result = await contractInstance.createPromo(PromoLogos[0], PromoLinks[0], PromoMessages[0], {from: alice, value: fee});
            const promoId = result.logs[0].args.promoId.toNumber();
            await contractInstance.approve(bob, promoId, {from: alice});
            await contractInstance.transferFrom(alice, bob, promoId, {from: bob, value: fee});
            const newOwner = await contractInstance.ownerOf(promoId);
            expect(newOwner).to.equal(bob);
        })
        it("should approve and then transfer a promo when the owner calls transferFrom", async () => {
            const result = await contractInstance.createPromo(PromoLogos[0], PromoLinks[0], PromoMessages[0], {from: alice, value: fee});
            const promoId = result.logs[0].args.promoId.toNumber();
            await contractInstance.approve(bob, promoId, {from: alice});
            await contractInstance.transferFrom(alice, bob, promoId, {from: alice, value: fee});
            const newOwner = await contractInstance.ownerOf(promoId);
            expect(newOwner).to.equal(bob);
         })
    })
})