import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProfileList from './ProfileList';
import StockPrice from './StockPrice';

const FINNHUB_TOKEN = process.env.REACT_APP_FINNHUB_TOKEN;

export default function StockDetail() {
  const { symbol: rawSymbol } = useParams();
  const symbol = rawSymbol.replace(/\.[a-z]+/gi, '');
  const [profile, setProfile] = useState([]);
  const [profileLoading, setprofileLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceDiff, setPriceDiff] = useState(null);
  const [priceDiffPercentage, setPriceDiffPercentage] = useState(null);

  useEffect(() => {
    getCompanyProfile();
    getStockPrice();
  }, []);

  const getCompanyProfile = async () => {
    setprofileLoading(true);
    const { data } = await axios.get(
      'https://finnhub.io/api/v1/stock/profile2?',
      {
        params: {
          symbol: symbol,
          token: FINNHUB_TOKEN
        }
      }
    );
    // console.log(data);
    setProfile(data);
    setprofileLoading(false);
  };

  const getStockPrice = async () => {
    setPriceLoading(true);
    const { data } = await axios.get(
      'https://finnhub.io/api/v1/stock/candle?',
      {
        params: {
          symbol: symbol,
          resolution: 'D',
          from: Date.parse('2020-02-13T00:00:00') / 1000,
          to: new Date().getTime(),
          token: FINNHUB_TOKEN
        }
      }
    );
    // console.log(data);

    const chartData = prepareChartData(data);
    const { _currentPrice, _priceDiff, _priceDiffPercentage } =
      getPriceDiff(data);
    setCurrentPrice(_currentPrice);
    setPriceDiff(_priceDiff);
    setPriceDiffPercentage(_priceDiffPercentage);
    setChartData(chartData);
    setPriceLoading(false);
    // console.log(chartData);
    // setNews(data);
  };

  const getPriceDiff = (data) => {
    const _currentPrice = data.c[data.c.length - 1].toFixed(2);
    const _previousPrice = data.c[data.c.length - 2].toFixed(2);
    const _priceDiff = (_currentPrice - _previousPrice).toFixed(2);
    const _priceDiffPercentage = ((_priceDiff / _previousPrice) * 100).toFixed(
      2
    );
    return {
      _currentPrice,
      _previousPrice,
      _priceDiff,
      _priceDiffPercentage
    };
  };

  const prepareChartData = (data) => {
    const chartData = [];
    for (let i = 0; i < data.t.length; i++) {
      chartData.push([data.t[i] * 1000, parseFloat(data.c[i].toFixed(2))]);
    }
    return chartData;
  };

  return (
    <div className="row mt-3">
      <div className="col-lg-4 order-2">
        <ProfileList profile={profile} loading={profileLoading} />
      </div>
      <div className="col-lg-8 order-1 mb-3">
        <StockPrice
          profile={profile}
          chartData={chartData}
          currentPrice={currentPrice}
          priceDiff={priceDiff}
          priceDiffPercentage={priceDiffPercentage}
          loading={priceLoading}
        />
      </div>
    </div>
  );
}
