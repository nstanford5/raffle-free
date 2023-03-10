/**
 * Can I allow users to make API calls with just their wallet address? I can think
 * of a workaround where the bot accepts the wallet address and a hardcoded account
 * handles the actual API call. Couldn't you just write it with a single participant?
 */
import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib({REACH_NO_WARN: 'Y'});
const sbal = stdlib.parseCurrency(100);
const acc0 = await stdlib.newTestAccount(sbal);
const ctc0 = acc0.contract(backend);
const MAX = 3;
let pAcc = [];
console.log(`Starting up...`);

// replace this in Testnet with a string input
const NFT = await stdlib.launchToken(acc0, "NFTok", "NFT", {supply: 1});

const startBuyers = async () => {
  const runBuyer = async (i) => {
    const acc = await stdlib.newTestAccount(sbal);
    console.log(`Account handle here: ${acc}`);
    await acc.tokenAccept(NFT.id);
    const ctc = acc.contract(backend, ctc0.getInfo());
    pAcc.push([acc, ctc]);
    try{
      const tNum = await ctc.a.getTicket(acc);
      console.log(`User ${i} got ticket number ${tNum}`);
      // const c = await ctc.v.howMany();
      // console.log(`Raffle Tickets left: ${c[1]}`);
    } catch (e) {
      console.log(e);
    };
  };
  await runBuyer(1);
  await runBuyer(2);
  await runBuyer(3);
};// end of startBuyers

const checkWin = async () => {
  for (const [acc, ctc] of pAcc){
    try{
      const b = await ctc.a.checkTicket(acc);
      console.log(`${acc.getAddress()} saw the result they win is: ${b}`);
    }catch(e){
      console.log(`Sorry, the winning ticket has already been claimed`);
    };
  };
};

await ctc0.p.Admin({
  params: {
    max: MAX,
    tok: NFT.id,
  },
  launched: async (c) => {
    console.log(`Ready at contract ${c}`);
    await startBuyers();
  },
  getNum: async (n) => {
    const num = Math.floor(Math.random() * n) + 1;
    return num;
  },
  showNum: async (n) => {
    console.log(`The winning number is ${n}`);
    // winning number is out, we can allow api calls
    // may need to gate this at the frontend
    await checkWin();
  },
});
console.log('Exiting...');