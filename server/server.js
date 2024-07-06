// `orderbook.50.${currentSymbol}`

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { WebsocketClient, RestClientV5 } = require('bybit-api');
require('dotenv').config();


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const wsConfig = {
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  market: 'v5'
};

const useTestnet = false;

const clientRest = new RestClientV5({
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  testnet: useTestnet,
  // Optional: enable to try parsing rate limit values from responses
  // parseAPIRateLimits: true
},)

const  subscribeToSymbol = (symbol) => {
  if (currentSymbol) {
    ws.unsubscribeV5([`orderbook.50.${currentSymbol}`], 'linear');
    
  }
  currentSymbol = symbol;
  ws.subscribeV5([`orderbook.50.${currentSymbol}`], 'linear');
};



const ws = new WebsocketClient(wsConfig);

let currentSymbol = ''; // Изначально нет активной подписки
let launchTime = '';
let serverTime = '';
let getKline = []
// console.log(getKline);

clientRest
        .getInstrumentsInfo({
            category: 'linear',
            symbol: currentSymbol,
        })
        .then((response) => {
            launchTime = (response.result.list[0].launchTime);
        })
        .catch((error) => {
            console.error(error);
        });
      
clientRest
        .getServerTime({
          category: 'linear',
          symbol: currentSymbol
        })
        .then((response) => {
          serverTime = response.time
        })
        .catch((error) => {
          console.error(error);
        })

clientRest
        .getKline({
            category: 'linear',
            symbol: currentSymbol,
            interval: '60',
            start: launchTime,
            end: serverTime,
        })
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.error(error);
        });

// orderbook

ws.on('update', (data) => {
  // Отправка данных всем подключенным клиентам (сокетам)
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      clientRest
        .getOrderbook({ 
          category: 'linear', symbol: currentSymbol 
        })
        .then(result => {
            result = {
              orderblock: result.result,
              launchTime: launchTime,
              serverTime: serverTime
            }
            client.send(JSON.stringify(result));
          // console.log("getOrderBook result: ", result.result);
        })
        .catch(err => {
          console.error("getOrderBook error: ", err);
        });
    }
  });
});

// Другие обработчики событий для WebSocket клиента ws

const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api/symbol/:symbol', (req, res) => {
  const { symbol } = req.params;
  const formattedSymbol = symbol.toUpperCase();
  subscribeToSymbol(formattedSymbol);
  // console.log(formattedSymbol);
  res.json({ message: `Subscribed to ${symbol}` });
});

app.get('/api/symbol/kLine', (req, res) => {
  res.json({ message: getKline });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



