'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { PriceHistoryEntry } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

interface PriceHistoryChartProps {
  history: PriceHistoryEntry[];
  storeName?: string;
}

export function PriceHistoryChart({ history, storeName }: PriceHistoryChartProps) {
  const data = history.map((entry) => ({
    date: formatDate(entry.timestamp),
    price: entry.price,
    timestamp: entry.timestamp,
  }));

  const minPrice = Math.min(...history.map((h) => h.price));
  const maxPrice = Math.max(...history.map((h) => h.price));
  const currentPrice = history[history.length - 1]?.price;
  const priceChange = history.length > 1 
    ? currentPrice - history[0].price 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History {storeName && `- ${storeName}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Current</p>
            <p className="text-xl font-bold">{formatPrice(currentPrice)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Lowest</p>
            <p className="text-xl font-bold text-green-600">{formatPrice(minPrice)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Highest</p>
            <p className="text-xl font-bold text-red-600">{formatPrice(maxPrice)}</p>
          </div>
        </div>

        {priceChange !== 0 && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              priceChange > 0 ? 'bg-red-50 text-red-900' : 'bg-green-50 text-green-900'
            }`}
          >
            <p className="text-sm font-medium">
              {priceChange > 0 ? '📈 Price increased' : '📉 Price decreased'} by{' '}
              {formatPrice(Math.abs(priceChange))} since first record
            </p>
          </div>
        )}

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatPrice(value), 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
