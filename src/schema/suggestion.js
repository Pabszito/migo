const mongoose = require('mongoose')

const suggestion = new mongoose.Schema({
    id: String,
    author: String,
    content: String
});

module.exports = mongoose.model("suggestion", suggestion)
