import React, { useState } from 'react';

const CATEGORIES = [
  { value: '', label: 'すべて' },
  { value: 'ポケモン', label: 'ポケモン' },
  { value: 'グッズ', label: 'グッズ' },
  { value: 'ポケモンのどうぐ', label: 'ポケモンのどうぐ' },
  { value: 'サポート', label: 'サポート' },
  { value: 'スタジアム', label: 'スタジアム' },
  { value: 'エネルギー', label: 'エネルギー' }
];

function SearchForm({ onSearch, loading }) {
  const [name, setName] = useState('');
  const [cardId, setCardId] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const params = {};
    if (name.trim()) params.name = name.trim();
    if (cardId.trim()) params.cardId = cardId.trim();
    if (category) params.category = category;
    
    if (Object.keys(params).length === 0) {
      alert('検索条件を少なくとも1つ入力してください');
      return;
    }
    
    onSearch(params);
  };

  const handleReset = () => {
    setName('');
    setCardId('');
    setCategory('');
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-form-row">
        <div className="search-form-group">
          <label htmlFor="name">カード名</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: ピカチュウ"
            disabled={loading}
          />
        </div>
        
        <div className="search-form-group">
          <label htmlFor="cardId">カードID</label>
          <input
            type="text"
            id="cardId"
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            placeholder="例: 46326"
            pattern="\d{5}"
            maxLength="5"
            disabled={loading}
          />
        </div>
        
        <div className="search-form-group">
          <label htmlFor="category">カテゴリ</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="search-form-actions">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? '検索中...' : '検索'}
        </button>
        <button type="button" onClick={handleReset} disabled={loading} className="btn btn-secondary">
          リセット
        </button>
      </div>
    </form>
  );
}

export default SearchForm;
