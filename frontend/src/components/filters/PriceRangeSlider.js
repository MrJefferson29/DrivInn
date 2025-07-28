import React from 'react';
import styled from 'styled-components';
import { FaDollarSign } from 'react-icons/fa';
import { useFilters } from '../../context/FiltersContext';

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

const RangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
  @media (max-width: 700px) {
    gap: 8px;
    margin-bottom: 10px;
  }
`;

const Label = styled.label`
  font-size: 1.05rem;
  font-weight: 600;
  color: #444;
`;

const PriceInput = styled.input`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid #ddd;
  font-size: 1.1rem;
  background: #fafbfc;
  outline: none;
  width: 100px;
  transition: border 0.2s;
  @media (max-width: 700px) {
    font-size: 1rem;
    padding: 8px 8px;
    border-radius: 8px;
    width: 70px;
  }
  &:focus {
    border: 1.5px solid #FF385C;
    background: #fff;
  }
`;

const Dash = styled.span`
  font-size: 1.3rem;
  color: #aaa;
  margin: 0 8px;
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

const PriceRangeSlider = ({ value = [0, 1000], onApply, onCancel }) => {
  const [min, setMin] = React.useState(value[0]);
  const [max, setMax] = React.useState(value[1]);

  const handleMinChange = (e) => {
    const v = Number(e.target.value);
    setMin(v);
  };
  const handleMaxChange = (e) => {
    const v = Number(e.target.value);
    setMax(v);
  };
  const handleClear = () => {
    setMin(0);
    setMax(1000);
  };
  const handleApply = () => {
    onApply([min, max]);
  };

  return (
    <div>
      <SectionTitle><FaDollarSign /> Price</SectionTitle>
      <RangeRow>
        <div style={{ flex: 1 }}>
          <Label>Min price</Label>
          <PriceInput
            type="number"
            value={min}
            min={0}
            max={max}
            onChange={handleMinChange}
          />
        </div>
        <Dash>-</Dash>
        <div style={{ flex: 1 }}>
          <Label>Max price</Label>
          <PriceInput
            type="number"
            value={max}
            min={min}
            max={10000}
            onChange={handleMaxChange}
          />
        </div>
      </RangeRow>
      <BottomBar style={{ justifyContent: 'center', gap: 12 }}>
        <ClearAllBtn onClick={handleClear}>Clear</ClearAllBtn>
        <ClearAllBtn as="button" style={{ borderColor: '#aaa', color: '#444' }} onClick={onCancel}>Cancel</ClearAllBtn>
        <ClearAllBtn as="button" style={{ background: '#FF385C', color: '#fff', borderColor: '#FF385C' }} onClick={handleApply}>Apply</ClearAllBtn>
      </BottomBar>
    </div>
  );
};

export default PriceRangeSlider; 