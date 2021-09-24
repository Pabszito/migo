const mongoose = require('mongoose')

const suggestion = new mongoose.Schema({
    id: Number,
    messageId: String,
    author: String,
    content: String
});

module.exports = mongoose.model("suggestion", suggestion)
