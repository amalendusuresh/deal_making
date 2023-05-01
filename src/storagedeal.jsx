const express = require('express');
const { makeStorageDeal } = require('./makeStorageDeal');

const app = express();
app.use(express.json());

app.post('/storage-deal', async (req, res) => {
  const { miner, provider, httpUrl, commp, carSize, pieceSize, payloadCid } = req.body;
  try {
    const output = await makeStorageDeal(miner, provider, httpUrl, commp, carSize, pieceSize, payloadCid);
    res.send(output);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
