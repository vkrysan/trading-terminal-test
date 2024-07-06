import React, { useEffect, useState } from 'react';
import './OrderBook.css';
import Select from 'react-select';
import axios from 'axios';
import MyChart from './MyChart';
import { Line } from 'react-chartjs-2';

const OrderBook = () => {
  const [orderBookData, setOrderBookData] = useState([]);
  const [orderLowerBookData, setOrderLowerBookData] = useState([]);
  const [cryptocurrencies, setCryptocurrencies] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState('BTCUSDT');
  const [kLine, setKline] = useState([]);
  let launchTime = ''
  let serverTime = ''
  // const [cryptoPosition, setCryptoPosition] = useState(2)
  // console.log(kLine);


  useEffect(() => {
    fetchCryptocurrencies();
  }, []);

  const fetchCryptocurrencies = async () => {
    try {
      const response = await axios.get('https://api.bybit.com/v2/public/symbols', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
      });
      const data = response.data.result
        .filter(item => item.name.includes('USDT'))
        .map(item => ({
          value: item.name,
          label: item.name.toUpperCase(),
        }));
      setCryptocurrencies(data);
    } catch (error) {
      console.error('Error fetching cryptocurrencies:', error);
    }
  };

  const handleCryptoChange = (selectedOption) => {
    setSelectedCrypto(selectedOption);
    fetchSelectedSymbol(selectedOption.value);
    fetchTest(selectedOption.value);
  };

  const fetchSelectedSymbol = async (cryptoSymbol) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/symbol/${cryptoSymbol}`);
      // console.log(response.data);
    } catch (error) {
      console.error('Error fetching new symbol data:', error);
    }
  };

  // useEffect(() => {
  //   fetchTest();
  // }, []);

  const fetchTest = async (cryptoSymbol) => {
    try {
      const response = await axios.get(`https://api.bybit.com/v5/market/kline?category=linear&symbol=${cryptoSymbol}&interval=60&start=${launchTime}&end=${serverTime}`);
      console.log(response.data.result.list);
      let newData = response.data.result.list
        const chartData = newData.map(item => ({
          t: new Date(parseInt(item[0])).toLocaleDateString(), // timestamp
          // o: parseFloat(item[1]), // open
          // h: parseFloat(item[2]), // high
          // l: parseFloat(item[3]), // low
          c: parseFloat(item[4])  // close
        }))
        setKline(chartData);
      
    } catch (error) {
      console.error('Error fetching new symbol data:', error);
    }
  }

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:5000/api/symbol/${selectedCrypto.value}`); // Замените на адрес вашего сервера

     ws.onopen = () => {
      console.log('WebSocket connected');
    };

     ws.onmessage = (event) => {
      const data  =  JSON.parse(event.data);
      // console.log(data);
      serverTime = data.serverTime
      launchTime = data.launchTime
      // Обработка данных для сокращения цены до 0 знаков после запятой и суммирования количества
      if (data.orderblock.a.length === 0 || data.orderblock.b.length === 0) {
        return 0
      } else {

      const updatedData = data.orderblock.a.map(item => ({
        price: parseFloat(+item[0]), // Сокращаем до 0 знаков после запятой
        count: (+item[1])
      })).sort((a, b) => b.price - a.price);

      const updatedDataLower = data.orderblock.b.map(item => ({
        price: parseFloat(+item[0]), // Сокращаем до 0 знаков после запятой
        count: (+item[1])
      }));

      // Объединяем одинаковые значения price и суммируем count
      const groupedData = updatedData.reduce((acc, curr) => {
        const existingItem = acc.find(item => item.price === curr.price);
        if (existingItem) {
          existingItem.count += curr.count;
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);

      const groupedDataLower = updatedDataLower.reduce((acc, curr) => {
        const existingItem = acc.find(item => item.price === curr.price);
        if (existingItem) {
          existingItem.count += curr.count;
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);

      setOrderBookData(groupedData); // Обновляем данные о стакане ордеров
      setOrderLowerBookData(groupedDataLower);
    }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close(); // Закрываем соединение при размонтировании компонента
    };
  }, []);

  const allCounts = [...orderBookData, ...orderLowerBookData].map(order => order.count);
  const averageCount = allCounts.reduce((sum, count) => sum + count, 0) / allCounts.length;

  // график
  const coinTimestap = []
  const coinPrice = []
  for (let i = 0; i < kLine.length; i++) {
    coinTimestap.push(kLine[i].t)
    coinPrice.push(kLine[i].c)
  }
  console.log();
  
  const data = {
    labels: coinTimestap,
    datasets: [{
      label: 'My First Dataset',
      data: coinPrice,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };
  
  return (
    <>
    <div style={{display: 'flex'}}>
    <div className="order-book">
      <h1>Order Book Data</h1>
      <div className='selectors-container'>
      <Select
        id="crypto-selector"
        value={selectedCrypto}
        onChange={handleCryptoChange}
        options={cryptocurrencies}
        placeholder="My Crypto"
      />
      {/* <select id="crypto-selector2" value={cryptoPosition} onChange={(event) => setCryptoPosition(event.target.value)}>
        <option value="2">0.01</option>
        <option value="4">0.0001</option>
        <option value="6">0.000001</option>
        <option value="8">0.00000001</option>
      </select> */}
      </div>
      <div className="tables">
        <div>
          <h2>Prices</h2>
          <ul className="price-list">
            {orderBookData.map((order, index) => (
              <li key={index} className="price-item-top">
                {order.price}
              </li>
            ))}
            <p className="current-price">
              Цена:
            </p>
            {orderLowerBookData.map((order, index) => (
              <li key={index} className="price-item-bottom">
                {order.price}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Counts</h2>
          <ul className="count-list">
            {orderBookData.map((order, index) => (
              <li key={index} className={`count-item-top ${order.count > averageCount ? 'highlight-red' : ''}`}>
                {order.count}
              </li>
            ))}
            <p className="current-price">
              {orderBookData[0]?.price - ((orderBookData[0]?.price) - (orderLowerBookData[0]?.price))}
            </p>
            {orderLowerBookData.map((order, index) => (
              <li key={index} className={`count-item-bottom ${order.count > averageCount ? 'highlight-green' : ''}`}>
                {order.count}
              </li>
              
            ))}
          </ul>
        </div>
      </div>
    </div>
    <div style={{width: '100%', height: '100%'}}>
    <MyChart data={data} />
    </div>
    </div>
    
    </>
  );
};

export default OrderBook;