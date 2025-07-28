import React from 'react';
import styled from 'styled-components';
import { FaHome, FaCar } from 'react-icons/fa';
import { useFilters } from '../../context/FiltersContext';

const types = [
  { id: 'apartment', label: 'Apartment', icon: FaHome },
  { id: 'car', label: 'Car', icon: FaCar },
];

const SectionTitle = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  @media (max-width: 700px) {
    font-size: 1.1rem;
    margin-bottom: 12px;
  }
`;

const PillsRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 18px;
  @media (max-width: 700px) {
    gap: 8px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
`;

const TypePill = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 999px;
  border: 1.5px solid #ddd;
  background: #fafbfc;
  font-size: 1.1rem;
  font-weight: 600;
  color: #444;
  cursor: pointer;
  transition: background 0.18s, border 0.18s, color 0.18s;
  user-select: none;
  &:hover, &:focus-within {
    background: #ffe1e7;
    border: 1.5px solid #FF385C;
    color: #FF385C;
  }
  input[type="checkbox"] {
    display: none;
  }
  &.selected {
    background: #FF385C;
    color: #fff;
    border: 1.5px solid #FF385C;
  }
  @media (max-width: 700px) {
    font-size: 1rem;
    padding: 8px 14px;
  }
`;

const BottomBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

const ClearAllBtn = styled.button`
  background: none;
  border: 1.5px solid #FF385C;
  color: #FF385C;
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: #FF385C;
    color: #fff;
  }
`;

const TypeMultiSelect = ({ value = [], onApply, onCancel }) => {
  const [localSelected, setLocalSelected] = React.useState(value);

  const handleChange = (id) => {
    if (localSelected.includes(id)) {
      setLocalSelected(localSelected.filter(t => t !== id));
    } else {
      setLocalSelected([...localSelected, id]);
    }
  };
  const handleClear = () => {
    setLocalSelected([]);
  };
  const handleApply = () => {
    onApply(localSelected);
  };

  return (
    <div>
      <SectionTitle><FaHome /> Type</SectionTitle>
      <PillsRow>
        {types.map(type => {
          const Icon = type.icon;
          return (
            <TypePill key={type.id} className={localSelected.includes(type.id) ? 'selected' : ''}>
              <input
                type="checkbox"
                checked={localSelected.includes(type.id)}
                onChange={() => handleChange(type.id)}
              />
              <Icon style={{ fontSize: 20 }} />
              {type.label}
            </TypePill>
          );
        })}
      </PillsRow>
      <BottomBar style={{ justifyContent: 'center', gap: 12 }}>
        <ClearAllBtn onClick={handleClear}>Clear</ClearAllBtn>
        <ClearAllBtn as="button" style={{ borderColor: '#aaa', color: '#444' }} onClick={onCancel}>Cancel</ClearAllBtn>
        <ClearAllBtn as="button" style={{ background: '#FF385C', color: '#fff', borderColor: '#FF385C' }} onClick={handleApply}>Apply</ClearAllBtn>
      </BottomBar>
    </div>
  );
};

export default TypeMultiSelect; 