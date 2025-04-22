const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
const mongoose = require("mongoose");
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

    mongoose
    .connect("mongodb+srv://ldford711:6sdrsTeoX3cn0wlP@cluster-logan-df.eqj2ybp.mongodb.net/")
    .then(() => {
        console.log("connected to mongodb");
    })
    .catch((error) => {
    console.log("couldn't connect to mongodb", error);
    });

const houseSchema = new mongoose.Schema({
    name:String,
    size:Number,
    bedrooms:Number,
    bathrooms:Number,
    main_image:String
});

const House = mongoose.model("House", houseSchema);

app.get("/",(req, res)=>{
    res.sendFile(__dirname+"/index.html");
});

app.get("/api/houses", async(req, res)=>{
    const houses = await House.find();
    res.send(houses);
});

app.post("/api/houses", upload.single("img"), async(req,res)=>{
    const result = validateHouse(req.body);


    if(result.error){
        console.log("I have an error");
        res.status(400).send(result.error.deatils[0].message);
        return;
    }

    const house = new House({
        name:req.body.name,
        size:req.body.size,
        bedrooms:req.body.bedrooms,
        bathrooms:req.body.bathrooms,
    });

    //adding image
    if(req.file){
        house.main_image = req.file.filename;
    }

    const newHouse = await house.save();
    res.status(200).send(newHouse);
});

app.put("/api/houses/:id", upload.single("img"), async(req,res)=>{

    const result = validateHouse(req.body);

    if(result.error){
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const fieldsToUpdate = {
        name:req.body.name,
        size:req.body.size,
        bedrooms:req.body.bedrooms,
        bathrooms:req.body.bathrooms
    }

    if(req.file){
        fieldsToUpdate.main_image = req.file.filename;
    }

    const wentThrough = await House.updateOne({_id:req.params.id}, fieldsToUpdate);
    const house = await House.findOne({_id:req.params.id});
    
    res.status(200).send(house);
});

app.delete("/api/houses/:id", async(req,res)=>{
    const house = await House.findByIdAndDelete(req.params.id);
    res.status(200).send(house);
});

const validateHouse = (house) => {
    const schema = Joi.object({
        _id:Joi.allow(""),
        name:Joi.string().min(3).required(),
        size:Joi.number().required().min(0),
        bedrooms:Joi.number().required().min(0),
        bathrooms:Joi.number().required().min(0),

    });

    return schema.validate(house);
};

app.listen(3001, ()=>{
    console.log("I'm listening");
});