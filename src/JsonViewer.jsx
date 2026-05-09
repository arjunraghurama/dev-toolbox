import React, { useState } from 'react';

const CaretPlaceholder = () => <span className="json-caret" style={{ visibility: 'hidden' }}>▶</span>;

const JsonNode = ({ label, value, isLast }) => {
  const [expanded, setExpanded] = useState(true);

  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  const renderValue = () => {
    if (value === null) return <span className="json-null">null</span>;
    if (typeof value === 'boolean') return <span className="json-boolean">{value ? 'true' : 'false'}</span>;
    if (typeof value === 'number') return <span className="json-number">{value}</span>;
    if (typeof value === 'string') return <span className="json-string">"{value}"</span>;
    return null;
  };

  if (!isObject) {
    return (
      <div className="json-line">
        <CaretPlaceholder />
        {label && <span className="json-key">"{label}": </span>}
        {renderValue()}
        {!isLast && <span className="json-comma">,</span>}
      </div>
    );
  }

  const keys = Object.keys(value);
  const isEmpty = keys.length === 0;
  const startBracket = isArray ? '[' : '{';
  const endBracket = isArray ? ']' : '}';

  if (isEmpty) {
    return (
      <div className="json-line">
        <CaretPlaceholder />
        {label && <span className="json-key">"{label}": </span>}
        <span className="json-bracket">{startBracket}{endBracket}</span>
        {!isLast && <span className="json-comma">,</span>}
      </div>
    );
  }

  return (
    <div className="json-node">
      <div className="json-line json-expandable" onClick={(e) => {
        e.stopPropagation();
        setExpanded(!expanded);
      }}>
        <span className={`json-caret ${expanded ? 'expanded' : ''}`}>▶</span>
        {label && <span className="json-key">"{label}": </span>}
        <span className="json-bracket">{startBracket}</span>
        {!expanded && <span className="json-collapsed-text"> ... {endBracket}{!isLast ? ',' : ''}</span>}
      </div>
      {expanded && (
        <div className="json-children">
          {keys.map((key, index) => (
            <JsonNode
              key={key}
              label={isArray ? null : key}
              value={value[key]}
              isLast={index === keys.length - 1}
            />
          ))}
        </div>
      )}
      {expanded && (
        <div className="json-line">
          <CaretPlaceholder />
          <span className="json-bracket">{endBracket}</span>
          {!isLast && <span className="json-comma">,</span>}
        </div>
      )}
    </div>
  );
};

export default function JsonViewer({ data }) {
  if (data === undefined || data === '') return null;
  return (
    <div className="json-viewer">
      <JsonNode label={null} value={data} isLast={true} />
    </div>
  );
}
