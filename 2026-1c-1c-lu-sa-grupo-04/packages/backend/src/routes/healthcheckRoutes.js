import express from "express"

// Los imports necesarios para el router
const healthcheckRouter = express.Router();

healthcheckRouter.route('/')
    .get((req,res) =>{
      res.status(200);
      res.json({
       status: "ok"
      })}); 

export default healthcheckRouter