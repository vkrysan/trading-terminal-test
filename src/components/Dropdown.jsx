// src/components/Dropdown.js
import React, { useState, useEffect } from 'react';
import { fetchFuturesSymbols } from '../api';
import { DropdownButton, Dropdown } from 'react-bootstrap';

const SymbolDropdown = ({ onSelectSymbol }) => {
  const [symbols, setSymbols] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFuturesSymbols();
      setSymbols(data);
    };

    fetchData();
  }, []);

  return (
    <DropdownButton id="dropdown-basic-button" title="Select Symbol">
      {symbols.map(symbol => (
        <Dropdown.Item key={symbol.name} onClick={() => onSelectSymbol(symbol.name)}>
          {symbol.name}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

export default SymbolDropdown;
