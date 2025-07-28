import React from 'react';
import styled from 'styled-components';
import { FaUsers, FaMinus, FaPlus } from 'react-icons/fa';
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

const StepperRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  @media (max-width: 700px) {
    margin-bottom: 10px;
    gap: 6px;
  }
`;

const Label = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #444;
`;

const Helper = styled.div`
  font-size: 0.98rem;
  color: #888;
  margin-top: 2px;
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StepBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid #ddd;
  background: #fff;
  color: #FF385C;
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s, border 0.18s;
  &:hover, &:focus {
    background: #ffe1e7;
    border: 1.5px solid #FF385C;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (max-width: 700px) {
    width: 28px;
    height: 28px;
    font-size: 1rem;
  }
`;

const Count = styled.div`
  font-size: 1.15rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
  @media (max-width: 700px) {
    font-size: 1rem;
    min-width: 18px;
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

const GuestsRangeSlider = ({ value = [1, 10], onApply, onCancel }) => {
  const [min, setMin] = React.useState(value[0]);
  const [max, setMax] = React.useState(value[1]);

  const handleMinChange = (val) => {
    setMin(val);
  };
  const handleMaxChange = (val) => {
    setMax(val);
  };
  const handleClear = () => {
    setMin(1);
    setMax(10);
  };
  const handleApply = () => {
    onApply([min, max]);
  };

  return (
    <div>
      <SectionTitle><FaUsers /> Who</SectionTitle>
      <StepperRow>
        <div>
          <Label>Min guests</Label>
          <Helper>Minimum number of guests</Helper>
        </div>
        <Stepper>
          <StepBtn onClick={() => handleMinChange(Math.max(1, min - 1))} disabled={min <= 1}><FaMinus /></StepBtn>
          <Count>{min}</Count>
          <StepBtn onClick={() => handleMinChange(min + 1)} disabled={min >= max}><FaPlus /></StepBtn>
        </Stepper>
      </StepperRow>
      <StepperRow>
        <div>
          <Label>Max guests</Label>
          <Helper>Maximum number of guests</Helper>
        </div>
        <Stepper>
          <StepBtn onClick={() => handleMaxChange(Math.max(min, max - 1))} disabled={max <= min}><FaMinus /></StepBtn>
          <Count>{max}</Count>
          <StepBtn onClick={() => handleMaxChange(max + 1)} disabled={max >= 20}><FaPlus /></StepBtn>
        </Stepper>
      </StepperRow>
      <BottomBar style={{ justifyContent: 'center', gap: 12 }}>
        <ClearAllBtn onClick={handleClear}>Clear</ClearAllBtn>
        <ClearAllBtn as="button" style={{ borderColor: '#aaa', color: '#444' }} onClick={onCancel}>Cancel</ClearAllBtn>
        <ClearAllBtn as="button" style={{ background: '#FF385C', color: '#fff', borderColor: '#FF385C' }} onClick={handleApply}>Apply</ClearAllBtn>
      </BottomBar>
    </div>
  );
};

export default GuestsRangeSlider; 