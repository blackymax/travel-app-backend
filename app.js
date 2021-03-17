const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const userSchema = require('./models/userSchema');
const countrySchema = require('./models/countrySchema');

const app = express();

const PORT = config.get('port') || 5000;

app.use(express.json({ limit: 15728640 }));

app.set('view engine', 'ejs');

app.use('/api', require('./routes/routes'));

async function start() {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    app.listen(PORT, (err) => {
      if (err) {
        console.log('something bad happened', err);
      }
      console.log(`server is listening on ${PORT}`);
    });
  } catch (e) {
    console.log('Server Error', e.message);
    process.exit(1);
  }
}
start();
