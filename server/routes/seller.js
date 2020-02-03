const router = require('express').Router();
const Product = require('../models/product');
const checkJWT = require('../middlewares/check-jwt');
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'gdesigns',
  api_key: '429854764125427',
  api_secret: 'PxEdUKCLC9Shs-DJbMWUEmZGC-s'
});


router.route('/products')
  .get(checkJWT, (req, res, next) => {
    Product.find({ owner: req.decoded.user._id })
      .populate('owner')
      .populate('category')
      .exec((err, products) => {
        if (products) {
          res.json({
            success: true,
            message: "Products",
            products: products
          });
        }
      });
  })
  .post(checkJWT, (req, res, next) => {
    console.log('req.body ', req.body);
    console.log('-----------------------');

    cloudinary.v2.uploader.upload(req.body.product_picture, function (error, result) {
      try {
        if (error) {
          throw error;
        }
        console.log('cloudinary result ', result);
        let product = new Product();
        product.owner = req.decoded.user._id;
        product.category = req.body.categoryId;
        product.title = req.body.title;
        product.price = req.body.price;
        product.description = req.body.description;
        product.image_name = req.body.product_image_name;
        product.image = result.url;
        // product.image = result.secure_url;
        product.save();
        res.json({
          success: true,
          message: 'Successfully Added the product'
        });
      } catch (err) {
        res.json({
          success: false,
          message: 'Unable to save image to cloudinary'
        })
      }

      console.log(result, error);
    });

  });

router.route('/products/getById')
  .get(checkJWT, (req, res, next) => {
    Product.findById({ _id: req.query.id }, function (err, products) {
      if (err) {
        console.log('error retrieving product byid ', err);
      } else {
        res.json({
          success: true,
          products: products,
          message: products !== null ? 'Successfully retrieved the product by id' : 'Product not found'
        });
      }
    });
  });


  router.route('/products/edit')
  .post(checkJWT, (req, res, next) => {
    console.log('edit ', req.body);
    Product.findByIdAndUpdate(req.body.id, req.body, {new: true}, function (err, products) {
      if (err) {
        console.log('error editing product ', err);
      } else {
        res.json({
          success: true,
          products: products,
          message: products !== null ? 'Successfully edited the product' : 'Product not found'
        });
      }
    });
  });


router.route('/products/delete')
  .get(checkJWT, (req, res, next) => {
    Product.findByIdAndRemove({ _id: req.query.id }, function (err, products) {
      if (err) {
        console.log('error deleting product ', err);
      } else {
        res.json({
          success: true,
          products: products,
          message: products !== null ? 'Successfully deleted the product' : 'Product not found'
        });
      }
    });
  });

module.exports = router;
