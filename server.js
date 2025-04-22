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
  .connect("mongodb+srv://portiaportia:RCq4HTMF7ZXfeU8O@data.ng58qmq.mongodb.net/")
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
  });
  
app.get("/",(req, res)=>{
    res.sendFile(__dirname+"/index.html");
});

let houses = [
    {
    "_id":1,
    "name": "Farmhouse",
    "size": 2000,
    "bedrooms": 3,
    "bathrooms": 2.5,
    "features": [
    "wrap around porch",
    "attached garage"
    ],
    "main_image": "farm.webp",
    "floor_plans": [
    {
    "name": "Main Level",
    "image": "farm-floor1.webp"
    },
    {
    "name": "Basement",
    "image": "farm-floor2.webp"
    }
    ]
    },
    {
    "_id":2,
    "name": "Mountain House",
    "size": 1700,
    "bedrooms": 3,
    "bathrooms": 2,
    "features": [
    "grand porch",
    "covered deck"
    ],
    "main_image": "mountain-house.webp",
    "floor_plans": [
    {
    "name": "Main Level",
    "image": "mountain-house1.webp"
    },
    {
    "name": "Optional Lower Level",
    "image": "mountain-house2.webp"
    },
    {
    "name": "Main Level Slab Option",
    "image": "mountain-house3.jpg"
    }
    ]
    },
    {
    "_id":3,
    "name": "Lake House",
    "size": 3000,
    "bedrooms": 4,
    "bathrooms": 3,
    "features": [
    "covered deck",
    "outdoor kitchen",
    "pool house"
    ],
    "main_image": "farm.webp",
    "floor_plans": [
    {
    "name": "Main Level",
    "image": "lake-house1.webp"
    },
    {
    "name": "Lower Level",
    "image": "lake-house2.webp"
    }
    ]
    }
];

app.get("/api/houses", (req, res)=>{
    res.send(houses);
});

app.post("/api/houses", upload.single("img"), (req,res)=>{
    const result = validateHouse(req.body);


    if(result.error){
        console.log("I have an error");
        res.status(400).send(result.error.deatils[0].message);
        return;
    }

    const house = {
        _id: houses.length,
        name:req.body.name,
        size:req.body.size,
        bedrooms:req.body.bedrooms,
        bathrooms:req.body.bathrooms,
    };

    //adding image
    if(req.file){
        house.main_image = req.file.filename;
    }

    houses.push(house);
    res.status(200).send(house);
});

app.put("/api/houses/:id", upload.single("img"),(req,res)=>{
    const house = houses.find((house)=>house._id===parseInt(req.params.id));

    if(!house){
        res.status(404).send("The house with the provided id was not found");
        return;
    }

    const result = validateHouse(req.body);

    if(result.error){
        res.status(400).send(result.error.details[0].message);
        return;
    }

    house.name = req.body.name;
    house.description = req.body.description;
    house.size = req.body.size;
    house.bathrooms = req.body.bathrooms;
    house.bedrooms = req.body.bedrooms;

    if(req.file){
        house.main_image = req.file.filename;
    }

    res.status(200).send(house);
});

app.delete("/api/houses/:id",(req,res)=>{
    console.log("I'm trying to delete" + req.params.id);
    const house = houses.find((house)=>house._id===parseInt(req.params.id));

    if(!house){
        console.log("Oh no i wasn't found");
        res.status(404).send("The house with the provided id was not found");
        return;
    }
    console.log("YAY You found me");
    console.log("The house you are deleting is " + house.name);
    const index = houses.indexOf(house);
    houses.splice(index,1);
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