const mongoose = require('mongoose');


  const connection = async () => {
    await mongoose.connect(`mongodb+srv://admin:admin123@cluster0.u6a6eyt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
     .then(() => {
       console.log(`🍀 DB is connected!`);
     })
     .catch((error) => {
       console.log(`❌ Fail to connect in DB! \n ${error}`);
     })
   }

   module.exports = connection;