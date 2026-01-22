import React, { useState } from 'react';
import SearchForm from './components/SearchForm';
import CardList from './components/CardList';
import CardDetail from './components/CardDetail';
import { searchCards, getCardDetail } from './services/api';

function App() {
  const [cards, setCards] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({});

  const handleSearch = async (params, page = 1) => {
    setLoading(true);
    setError(null);
    setSelectedCard(null);
    setSearchParams(params);

    try {
      const response = await searchCards({ ...params, page, limit: 20 });
      
      if (response.success) {
        setCards(response.data.cards);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || '検索に失敗しました');
      }
    } catch (err) {
      setError(err.message || '検索中にエラーが発生しました');
      setCards([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (card) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCardDetail(card.cardId);
      
      if (response.success) {
        setSelectedCard(response.data);
      } else {
        setError(response.error?.message || 'カード詳細の取得に失敗しました');
      }
    } catch (err) {
      setError(err.message || 'カード詳細の取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && pagination && page <= pagination.totalPages) {
      handleSearch(searchParams, page);
    }
  };

  const handleCloseDetail = () => {
    setSelectedCard(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ポケモンカード検索ツール</h1>
      </header>
      
      <main className="app-main">
        <div className="app-container">
          <SearchForm onSearch={handleSearch} loading={loading} />
          
          {error && (
            <div className="error-message">
              <p>エラー: {error}</p>
            </div>
          )}
          
          {loading && cards.length === 0 && (
            <div className="loading">
              <p>読み込み中...</p>
            </div>
          )}
          
          {!loading && cards.length > 0 && (
            <CardList
              cards={cards}
              onCardClick={handleCardClick}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>
      
      {selectedCard && (
        <CardDetail card={selectedCard} onClose={handleCloseDetail} />
      )}
    </div>
  );
}

export default App;
