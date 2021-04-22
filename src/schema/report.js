const mongoose = require('mongoose')

const report = new mongoose.Schema({
    id: Number,
    messageId: String,
    author: String,
    reportedMember: String,
    reason: String,
    image: String
});

module.exports = mongoose.model("report", report)