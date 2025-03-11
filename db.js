const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/"

const connectToMongo = async() => {
    try{
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    }catch(error){
        console.error("Failed to connect to MongoDB : ",error.message);
        process.exit(1);
    }
};

module.exports=connectToMongo;

