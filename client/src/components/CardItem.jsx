import React from 'react';

function CardItem({ card, onClick }) {
  return (
    <div className="card-item" onClick={() => onClick(card)}>
      <div className="card-item-image">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="card-item-image-placeholder" style={{ display: card.imageUrl ? 'none' : 'flex' }}>
          画像なし
        </div>
      </div>
      
      <div className="card-item-info">
        <h3 className="card-item-name">{card.name}</h3>
        <p className="card-item-fullname">{card.fullName}</p>
        <div className="card-item-meta">
          <span className="card-item-category">{card.category}</span>
          {card.hp && <span className="card-item-hp">HP: {card.hp}</span>}
          {card.type && <span className="card-item-type">{card.type}</span>}
        </div>
      </div>
    </div>
  );
}

export default CardItem;
