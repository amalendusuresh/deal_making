const { exec } = require('child_process');

export const makeStorageDeal = async (miner, provider, httpUrl, commp, carSize, pieceSize, payloadCid) => {
  return new Promise((resolve, reject) => {
    const cmd = `./boost-deal.sh ${miner} ${provider} ${httpUrl} ${commp} ${carSize} ${pieceSize} ${payloadCid}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(new Error(stderr));
      } else {
        resolve(stdout);
      }
    });
  });
}

module.exports = {
  makeStorageDeal
};
