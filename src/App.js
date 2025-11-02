import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import NavigationBar from './components/NavigationBar';
import Main from './components/Main';
import MarketNews from './components/MarketNews';
import StockDetail from './components/StockDetail';
import Footer from './components/Footer';

const FINNHUB_TOKEN = process.env.REACT_APP_FINNHUB_TOKEN;

// TODO: how to handle error with axios async await

function App() {
  const [newsArticles, setNewsArticles] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = (e, query) => {
    e.preventDefault();
    // console.log(query);
    setQuery(query);
    // console.log(e.target[0].value);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    const getNewsArticles = async () => {
      setLoading(true);
      const { data } = await axios.get('https://finnhub.io/api/v1/news?', {
        params: {
          category: 'general',
          token: FINNHUB_TOKEN
        }
      });
      // console.log(data);
      setNewsArticles(data.slice(0, 10));
      setLoading(false);
    };

    getNewsArticles();
  }, []);

  useEffect(() => {
    const search = async () => {
      setLoading(true);
      const { data } = await axios.get('https://finnhub.io/api/v1/search', {
        params: {
          q: query,
          token: FINNHUB_TOKEN
        }
      });
      console.log(data.result);
      setResults(data.result);
      setLoading(false);
    };

    const timeoutId = setTimeout(() => {
      if (query) {
        search();
      }
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <Router>
      <header>
        <NavigationBar
          query={query}
          handleFormSubmit={handleFormSubmit}
          handleInputChange={handleInputChange}
        />
      </header>
      <main className="container">
        <Routes>
          <Route
            path="/"
            exact
            element={
              <>
                <Main query={query} results={results} loading={loading} />
                <MarketNews newsArticles={newsArticles} loading={loading} />
              </>
            }
          />
          <Route
            path="/search"
            element={<Main query={query} results={results} loading={loading} />}
          />
          <Route path="/:symbol" element={<StockDetail />} />
        </Routes>
      </main>
      <footer>
        <Footer />
      </footer>
    </Router>
  );
}

export default App;
