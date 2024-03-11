const mongoose = require('mongoose');

const cartsCollection = 'carts';

const cartsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'Product',  
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

const cartModel = mongoose.model(cartsCollection, cartsSchema);

module.exports = {
  cartModel,
};
