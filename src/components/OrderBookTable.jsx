// src/components/OrderBookTable.js
import React from 'react';
import { Table } from 'react-bootstrap';

const OrderBookTable = ({ orderBook }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Price</th>
          <th>Order Count</th>
          <th>Total Amount</th>
        </tr>
      </thead>
      <tbody>
        {orderBook.map((order, index) => (
          <tr key={index}>
            <td>{order.price}</td>
            <td>{order.size}</td>
            <td>{order.size * order.price}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default OrderBookTable;
