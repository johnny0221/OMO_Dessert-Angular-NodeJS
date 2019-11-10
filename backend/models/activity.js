const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
    name: String,
    image: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Activity', activitySchema);