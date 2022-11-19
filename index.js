const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const express = require('express');

const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2m0rny5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        const appointmentCollection = client.db('doctorsPortal').collection('appionmentOption')
        const bookingsCollection = client.db('doctorsPortal').collection('bookings')
        app.get('/appionmentOption', async (req, res) => {
            const date = req.query.date;
            console.log(date)
            const query = {}
            const options = await appointmentCollection.find(query).toArray()
            const bookingQuery = {appointmentDate: date}
            const alreadyBooked =await bookingsCollection.find(bookingQuery).toArray()
            options.forEach(option => {
                const optionBooked = alreadyBooked.filter(book => book.treatment === option.name)
                const bookedSlots = optionBooked.map(book => book.slot)
                const remainingSlots = option.slots.filter( slot => !bookedSlots.includes(slot))
                option.slots = remainingSlots;
                
            })
            res.send(options)
        });
        app.post('/bookings', async (req, res) => {
            const booking = req.body
            const result = await bookingsCollection.insertOne(booking)
            
            res.send(result)
        });

    }
    finally{

    }
}
run().catch(error => console.error(error));
app.get('/', async (req, res) => {
    res.send('Wellcome');

})




app.listen(port, (req, res) => {
    console.log(`Listening on ${port}`);
})