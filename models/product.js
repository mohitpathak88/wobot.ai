const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
        productName: {
            type: String,
            required:true,
            unique: true
          },
        description:{
            type: String,
            required: true
        },
        quantity:{
            type: Number,
            required:true,
          },
        price:{
            type: Number,
            required:true
          }
        //_createdBy:{
            //type: String,
            //required:true
          //},

});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;