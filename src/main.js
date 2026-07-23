import express from 'express';
import shortenerRouter from './app/routes/shortener.route.js';
import errorHandler from './app/errors/errorHandler.js'
import client from './app/clients/redis.client.js';
const app = express();
export const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/shortened', shortenerRouter);

app.get('/', (req, res) => {
    res.send('hello, world!');
})

app.use(errorHandler);

async function start(){
    await client.connect();
    app.listen(PORT, function(){
        console.log(`Listening on http://127.0.0.1:${PORT}`);
    })
}

start();

process.on("SIGTERM", async () => {
    await client.quit();
    process.exit(0);
});