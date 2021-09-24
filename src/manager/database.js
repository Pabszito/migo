const mongoose = require('mongoose');

module.exports = class DatabaseManager {

    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }

    async init() {
        mongoose.connect(this.config.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        }, (err) => {
            if(err) {
                this.logger.error(`Unable to connect to the Mongo database.`);
                return process.exit(1);
            }
            
            this.logger.info(`Connected to the Mongo database.`);
        });
    }
}