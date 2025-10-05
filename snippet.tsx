// Реализация сложного React-хука для получения инвестиционного портфеля из Tinkoff Invest API
// Используется SWR для кеширования и автообновления, TypeScript для типизации

import useSWR from 'swr';
import axios from 'axios';

type PortfolioPosition = {
  figi: string;
  ticker: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  profit: number;
};

type PortfolioResponse = {
  positions: PortfolioPosition[];
  totalValue: number;
  currency: string;
};

const fetchPortfolio = async (token: string): Promise<PortfolioResponse> => {
  const response = await axios.get('https://api-invest.tinkoff.ru/openapi/portfolio', {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Преобразование данных под нужную структуру
  return {
    positions: response.data.positions.map((p: any) => ({
      figi: p.figi,
      ticker: p.ticker,
      name: p.name,
      quantity: p.quantity,
      averagePrice: p.averagePositionPrice.value,
      currentPrice: p.currentPrice.value,
      profit: (p.currentPrice.value - p.averagePositionPrice.value) * p.quantity,
    })),
    totalValue: response.data.totalAmountPortfolio.value,
    currency: response.data.totalAmountPortfolio.currency,
  };
};

export function useTinkoffPortfolio(token: string) {
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['portfolio', token] : null,
    () => fetchPortfolio(token),
    { refreshInterval: 60000 } // автообновление каждую минуту
  );

  return {
    portfolio: data,
    isLoading,
    error,
    refresh: mutate,
  };
}