const express = require("express");
const multer = require("multer");
const Joi = require("joi");
const path = require("path");
const fs = require("fs");
const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb+srv://yassinemj3:yassinemj3@mjyassine.47j07gl.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define the Craft schema and model
const craftSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    supplies: [String]
});

const Craft = mongoose.model('Craft', craftSchema);

const app = express();
app.use(express.static('public'));

const uploadDir = 'uploads/';
fs.existsSync(uploadDir) || fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const craftSchemaJoi = Joi.object({
    craftName: Joi.string().required(),
    craftDescription: Joi.string().required(),
    supplies: Joi.array().items(Joi.string()).required()
});

app.get("/api/crafts", async (req, res) => {
    try {
        const crafts = await Craft.find();
        res.send(crafts);
    } catch (error) {
        res.status(500).send("Error retrieving crafts.");
    }
});

app.post("/api/crafts", upload.single('craftImage'), async (req, res) => {
    const validationResult = craftSchemaJoi.validate(req.body, { convert: false });
    if (validationResult.error) {
        return res.status(400).send(validationResult.error.details[0].message);
    }

    const newCraft = new Craft({
        name: req.body.craftName,
        image: req.file ? req.file.filename : '',
        description: req.body.craftDescription,
        supplies: req.body.supplies
    });

    try {
        const savedCraft = await newCraft.save();
        res.status(201).send(savedCraft);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.put("/api/updateCraft/:id", upload.none(), async (req, res) => {
    const { name, description, supplies } = req.body;
    try {
        const updatedCraft = await Craft.findByIdAndUpdate(req.params.id, {
            name, description, supplies
        }, { new: true });
        if (!updatedCraft) {
            return res.status(404).send('Craft not found');
        }
        res.send(updatedCraft);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.use('/uploads', express.static(uploadDir));

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
