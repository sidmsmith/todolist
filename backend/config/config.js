// Configuration settings for the application
const config = {
    databaseUrl: 'mongodb://localhost:27017/todolist',
    port: process.env.PORT || 3000,
};

module.exports = config;