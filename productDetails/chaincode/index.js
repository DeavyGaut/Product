/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const productDetails = require('./lib/productDetails');

module.exports.ProductDetails = productDetails;
module.exports.contracts = [productDetails];
