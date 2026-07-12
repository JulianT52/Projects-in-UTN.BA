import express from "express"
import { ProductController } from "../controllers/ProductController.js"

const productRouter = express.Router()
const productController = new ProductController

productRouter.route('/')    
    .get((req,res) => productController.findAll(req,res))
    .post((req,res) => productController.create(req,res))

export default productRouter