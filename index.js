const express = require('express');
const AuthRouter = require('./routes/AuthRoutes')
const app = express();
const cors = require('cors')

app.use(cors())
app.use(express.json());
app.use('/api', AuthRouter);
app.listen(process.env.APP_PORT, () => {
  console.log(`Running on ${process.env.APP_PORT}`);
});

module.exports = app;