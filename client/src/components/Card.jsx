const Card = ({ label, value, helper }) => (
  <div className="card">
    <div className="card__label">{label}</div>
    <div className="card__value">{value}</div>
    {helper && <div className="helper-text">{helper}</div>}
  </div>
);

export default Card;
