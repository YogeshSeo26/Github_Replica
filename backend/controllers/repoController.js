
const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

const createRepository = async(req, res) => {
    // res.send("Repository created!");

    const { owner, name, issues, content, description, visibility } = req.body;

    try {        

        if(!name) {
            return res.status(400).json({error: "Repository name is required!"});
        };

        if(!mongoose.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({ error: "Invalid User ID!" });
        };

        const newRepository = new Repository({
            name,
            description,
            visibility,
            owner,
            content,
            issues,
        });

        const result = await newRepository.save();

        res.status(201).json({
            message:"Repository created!", 
            repositoryID:result._id,
        });
    } catch(err) {
        console.error("Error during repository creation : ", err.message);
        res.status(500).send("Server error");
    };
};

const getAllRepositories = async(req, res) => {
    // res.send("All repositories fetched!");

    try {
        const repositories = await Repository.find({})
        .populate("owner")
        .populate("issues");

        res.json(repositories);
    } catch(err) {
        console.error("Error during fetching repositories : ", err.message);
        res.status(500).send("Server error");
    };
};

const fetchRepositoryById = async(req, res) => {
    // res.send("Repository Details Fetched!");

    const { id } = req.params;

    try {
        const repository = await Repository.find({ _id:id })
        .populate("owner")
        .populate("issues");
        
        res.json(repository);
    } catch(err) {
        console.error("Error during fetching repository : ", err.message);
        res.status(500).send("Server error");
    };
};

const fetchRepositoryByName = async(req, res) => {
    // res.send("Repository Details Fetched!");

    const { name } = req.params;

    try {
        const repository = await Repository.find({ name: name })
        .populate("owner")
        .populate("issues");
        
        res.json(repository);
    } catch(err) {
        console.error("Error during fetching repository : ", err.message);
        res.status(500).send("Server error");
    };
};

const fetchRepositoriesForCurrentUser = async(req, res) => {
    // res.send("Repositories for Logged In user Fetched!");
    const { userID } = req.params;

    try {
        const repositories = await Repository.find({ owner: userID });

        if(!repositories || repositories.length == 0) {
            return res.status(404).json({ error: "User Repositories not found!" });
        };

        res.json({ message: "Repositories found!", repositories });
    } catch(err) {
        console.error("Error during fetching user repositories : ", err.message);
        res.status(500).send("Server error");
    };
};

const updateRepositoryById = async(req, res) => {
    // res.send("Repository updated!");

    const { id } = req.params;
    const { content, description } = req.body;

    try {
        const repository = await Repository.findById(id);
        if(!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        };
        
        repository.content.push(content);
        repository.description = description;

        const updatedRepository = await repository.save();
        res.json({
            message: "Repository updated successfully!",
            repository: updatedRepository,
        });
    } catch(err) {
        console.error("Error during updating repository : ", err.message);
        res.status(500).send("Server error");
    };
};

const toggleVisibilityById = async(req, res) => {
    // res.send("Visibility Toggled!");

    const { id } = req.params;

    try {
        const repository = await Repository.findById(id);
        if(!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        };
        repository.content.push(content);
        repository.description = description;

        repository.visibility = !repository.visibility;

        const updatedRepository = await repository.save();
        res.json({
            message: "Repository visibility toggled successfully!",
            repository: updatedRepository,
        });
    } catch(err) {
        console.error("Error during toggling visibility : ", err.message);
        res.status(500).send("Server error");
    };
};

const deleteRepositoryById = async(req, res) => {
    // res.send("Repository Deleted!");

    const { id } = req.params;

    try {
        const repository = await Repository.findByIdAndDelete(id);
        if(!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        };

        res.json({
            message: "Repository deleted successfully!",
        });
    } catch(err) {
        console.error("Error during deleting repository : ", err.message);
        res.status(500).send("Server error");
    };
};

module.exports = {
    createRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoriesForCurrentUser,
    updateRepositoryById,
    toggleVisibilityById,
    deleteRepositoryById,
};