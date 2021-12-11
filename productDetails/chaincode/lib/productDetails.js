'use strict';

const { Contract } = require('fabric-contract-api');

class ProductDetails extends Contract {

    // AddProduct adds a new asset to the world state with given details.
    async AddProduct(ctx, productId,serialNo, mfgDate, expDate) {
        const asset = {
            ProductId: productId,
            SerialNo: serialNo,
            ManufacturingDate: mfgDate,
            ExpiryDate: expDate,
        };
        ctx.stub.putState(productId, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);
    }

    // ViewParticularProduct returns the asset stored in the world state with given productId.
    async ViewParticularProduct(ctx, productId) {
        const assetJSON = await ctx.stub.getState(productId); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${productId} does not exist`);
        }
        return assetJSON.toString();
    }


    // ViewAllProducts returns all assets found in the world state.
    async ViewAllProducts(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }


    // RemoveProduct deletes an given asset from the world state.
    async RemoveProduct(ctx, productId) {
        const exists = await this.AssetExists(ctx, productId);
        if (!exists) {
            throw new Error(`The asset ${productId} does not exist`);
        }
        return ctx.stub.deleteState(productId);
    }


// RemoveAllProducts deletes all products from the world state.
    async RemoveAllProducts(ctx) {
        const exists = await this.AssetExists(ctx);
        if (!exists) {
            throw new Error(`The assets does not exist`);
        }
        const allResults = [];
        const iterator = await ctx.stub.getState();
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }


        for (var i=0; i< allResults.length;i++){
            return ctx.stub.deleteState(i);
        }
    }


    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, productId) {
        const assetJSON = await ctx.stub.getState(productId);
        return assetJSON && assetJSON.length > 0;
    }

}

module.exports = ProductDetails;
