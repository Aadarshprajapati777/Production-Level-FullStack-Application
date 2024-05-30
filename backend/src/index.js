import connectDB from "./db/index.js";
import 'dotenv/config'
import app from "./app.js";


connectDB().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })

    app.on('error',(err)=>{
        console.log(err)
    })

}).catch((err)=>{
    console.log(err)
})