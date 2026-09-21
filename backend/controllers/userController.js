
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { MongoClient } = require("mongodb");

const dotenv = require("dotenv");

var ObjectId = require("mongodb").ObjectId;

dotenv.config();
const uri = process.env.MONGODB_URI;

// Global Variable
let client;

async function connectClient() {
    if(!client) {
        // , {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        // }
        client = new MongoClient(uri);
        await client.connect();
    };
};

async function signup(req, res) {
    // res.send("Signing up!");
    const { username, password, email } = req.body;
    try {
        await connectClient();
        const db = client.db("githubreplica");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({username});
        if(user) {
            return res.status(400).json({ message: "User already exists" });
        };

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            email,
            repositories : [],
            followedUsers : [],
            starRepos: [],
        };

        const result = await usersCollection.insertOne(newUser);
        const token = jwt.sign(
            {id:result.insertedId}, 
            process.env.JWT_SECRET_KEY, 
            {expiresIn: "1h"},
        );
        res.json({ token, userId: result.insertedId });
    } catch(err) {
        console.error("Error during signup : ", err.message);
        res.status(500).send("Server error");
    };
};

const login = async(req, res) => {
    // res.send("Logging in!");
    const { email, password } = req.body;

    try {
        await connectClient();
        const db = client.db("githubreplica");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "Invalid Credential" });
        };

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ message: "Invalid Credential" });
        };

        const token = jwt.sign(
            {id:user._id}, 
            process.env.JWT_SECRET_KEY, 
            {expiresIn: "1h"},
        );
        res.json({token, userId: user._id});
    } catch(err) {
        console.error("Error during login : ", err.message);
        res.status(500).send("Server error");
    };
};

async function getAllUsers (req, res) {
    // res.send("All users fetched!");

    try {
        await connectClient();
        const db = client.db("githubreplica");
        const usersCollection = db.collection("users");

        // to fetching multiple things we need to explicitly convert into .toArray()
        const users = await usersCollection.find({}).toArray();
        res.json(users);
    } catch(err) {
        console.error("Error during fetching : ", err.message);
        res.status(500).send("Server error");
    };
};

const getUserProfile = async(req, res) => {
    // res.send("Profile fetched!");
    const currentID = req.params.id;

    try {
        await connectClient();
        const db = client.db("githubreplica");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({
            // converting into MongoDb Object id, here we are not using mongoose
            _id: new ObjectId(currentID),
        });

        if(!user) {
            return res.status(404).json({ message: "User not found!" });
        };

        res.send(user, {message: "Profile fetched!"});
    } catch(err) {
        console.error("Error during fetching : ", err.message);
        res.status(500).send("Server error");
    };
};

const updateUserProfile = async(req, res) => {
    // res.send("Profile Updated!");

    const currentID = req.params.id;
    const { email, password } = req.body;

    try {

        await connectClient();
        const db = client.db("githubreplica");
        const usersCollection = db.collection("users");
        
        let updateFields = { email };
        if(password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashedPassword;
        };

        // mongodb package:- .findOneAndUpdate() and Mongoose package:- .findByIdAndUpdate()
        const result = await usersCollection.findOneAndUpdate(
            {
                _id: new ObjectId(currentID),
            }, 
            { $set: updateFields },
            {returnDocument: "after"},
        );

        if(!result.value) {
            return res.status(404).json({ message: "User not found!" });
        };

        res.send(result.value);
    } catch(err) {
        console.error("Error during updating : ", err.message);
        res.status(500).send("Server error");
    };
};

const deleteUserProfile = async(req, res) => {
    // res.send("Profile deleted!");

    const currentID = req.params.id;

    try {
        await connectClient();
        const db = client.db("githubreplica");
        const usersCollection = db.collection("users");        

        // mongodb package:- .deleteOne() and Mongoose package:- .findByIdAndDelete()
        const result = await usersCollection.deleteOne(
            {
                _id: new ObjectId(currentID),
            });

        if(result.deleteCount == 0) {
            return res.status(404).json({ message: "User not found!" });
        };

        res.send({message: "User Profile Deleted"});
    } catch(err) {
        console.error("Error during updating : ", err.message);
        res.status(500).send("Server error");
    };
};

module.exports = {
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
};