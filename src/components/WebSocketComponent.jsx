// src/components/WebSocketComponent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DropdownComponent from './Dropdown';
import OrderBookTable from './OrderBookTable';

const WebSocketComponent = () => {
  const [orderBook, setOrderBook] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const ws = new WebSocket('ws://localhost:5000');

  useEffect(() => {
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOrderBook(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSelectSymbol = async (symbol) => {
    setSelectedSymbol(symbol);
    try {
      await axios.get(`http://localhost:5000/api/symbol/${symbol}`);
    } catch (error) {
      console.error('Error selecting symbol:', error.message);
    }
  };

  return (
    <div>
      <h1>Realtime Order Book</h1>
      <DropdownComponent onSelectSymbol={handleSelectSymbol} />
      {selectedSymbol && <OrderBookTable orderBook={orderBook} />}
    </div>
  );
};

export default WebSocketComponent;
