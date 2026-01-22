import React from 'react';
import CardItem from './CardItem';

function CardList({ cards, onCardClick, pagination, onPageChange }) {
  if (!cards || cards.length === 0) {
    return (
      <div className="card-list-empty">
        <p>検索結果が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="card-list-container">
      {pagination && (
        <div className="card-list-header">
          <p className="card-list-count">
            検索結果: {pagination.total}件
            {pagination.totalPages > 1 && ` (${pagination.page}/${pagination.totalPages}ページ)`}
          </p>
        </div>
      )}
      
      <div className="card-list">
        {cards.map((card) => (
          <CardItem key={card.cardId} card={card} onClick={onCardClick} />
        ))}
      </div>
      
      {pagination && pagination.totalPages > 1 && (
        <div className="card-list-pagination">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="btn btn-secondary"
          >
            前へ
          </button>
          <span className="pagination-info">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="btn btn-secondary"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}

export default CardList;
