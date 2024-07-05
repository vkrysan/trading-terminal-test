import React, { useEffect, useState } from 'react';

const App = () => {
  const [orderBookData, setOrderBookData] = useState([]);
  const [orderLowerBookData, setOrderLowerBookData] = useState([]);


  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000'); // Замените на адрес вашего сервера

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Обработка данных для сокращения цены до 0 знаков после запятой и суммирования количества
      const updatedData = data.a.map(item => ({
        price: parseFloat(+item[0]).toFixed(2), // Сокращаем до 0 знаков после запятой
        count: (+item[1])
      }));

      const updatedDataLower = data.b.map(item => ({
        price: parseFloat(+item[0]).toFixed(2), // Сокращаем до 0 знаков после запятой
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
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close(); // Закрываем соединение при размонтировании компонента
    };
  }, []);

  return (
    <div>
      <h1>Order Book Data</h1>
      <ul>
        {orderBookData.map((order, index) => (
          <li key={index}>
            Price: {order.price}, Count: {order.count}
          </li>
        ))}
      </ul>
      <p>Текущая цена:</p>
      <ul>
      {orderLowerBookData.map((order, index) => (
          <li key={index}>
            Price: {order.price}, Count: {order.count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;


// Price: {(+order[0]).toFixed(0)}, Count: {order[1]}, Amount: {order.amount}