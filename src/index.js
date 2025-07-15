const express = require('express');
const eventRouter = require('./routes/event_routes');
const userRouter = require('./routes/user_routes');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/event',eventRouter);
app.use('/api/user',userRouter);
const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`server started at PORT ${PORT}`);
})



