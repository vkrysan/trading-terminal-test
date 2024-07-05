// `orderbook.50.${currentSymbol}`

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { WebsocketClient } = require('bybit-api');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const wsConfig = {
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  market: 'v5'
};

const ws = new WebsocketClient(wsConfig);

let currentSymbol = ''; // Изначально нет активной подписки


  const subscribeToSymbol = (symbol) => {
  if (currentSymbol) {
    ws.unsubscribeV5([`orderbook.50.${currentSymbol}`], 'linear');
  }
  currentSymbol = symbol;
  ws.subscribeV5([`orderbook.50.${currentSymbol}`], 'linear');
};


ws.on('update', (data) => {
  // Отправка данных всем подключенным клиентам (сокетам)
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data.data));
      console.log(data);
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
  const formattedSymbol = symbol.toUpperCase() + 'USDT';
  subscribeToSymbol(formattedSymbol);
  res.json({ message: `Subscribed to ${symbol}` });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
