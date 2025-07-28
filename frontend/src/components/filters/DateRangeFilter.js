import React from 'react';
import styled from 'styled-components';
import { FaCalendarAlt } from 'react-icons/fa';
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

const DateRow = styled.div`
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
  @media (max-width: 700px) {
    gap: 8px;
    margin-bottom: 10px;
  }
`;

const DateInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  @media (max-width: 700px) {
    gap: 2px;
  }
`;

const Label = styled.label`
  font-size: 1.05rem;
  font-weight: 600;
  color: #444;
  @media (max-width: 700px) {
    font-size: 0.98rem;
  }
`;

const DateInput = styled.input`
  padding: 10px 10px;
  border-radius: 10px;
  border: 1.5px solid #ddd;
  font-size: 1.05rem;
  background: #fafbfc;
  outline: none;
  transition: border 0.2s;
  @media (max-width: 700px) {
    font-size: 1rem;
    padding: 8px 8px;
    border-radius: 8px;
  }
  &:focus {
    border: 1.5px solid #FF385C;
    background: #fff;
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

const DateStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 18px;
  @media (max-width: 700px) {
    gap: 10px;
    margin-bottom: 10px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #eee;
  margin: 4px 0 4px 0;
  width: 100%;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateRangeFilter = ({ value = { start: '', end: '' }, onApply, onCancel }) => {
  const [localDateRange, setLocalDateRange] = React.useState(value);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setLocalDateRange({ start: '', end: '' });
  };

  const handleApply = () => {
    onApply(localDateRange);
  };

  return (
    <div>
      <SectionTitle><FaCalendarAlt /> Check in/out</SectionTitle>
      <DateStack>
        <div>
          <LabelRow><FaCalendarAlt style={{ color: '#FF385C' }} /><Label>Check in</Label></LabelRow>
          <DateInput
            type="date"
            name="start"
            value={localDateRange.start || ''}
            onChange={handleChange}
          />
        </div>
        <Divider />
        <div>
          <LabelRow><FaCalendarAlt style={{ color: '#FF385C' }} /><Label>Check out</Label></LabelRow>
          <DateInput
            type="date"
            name="end"
            value={localDateRange.end || ''}
            onChange={handleChange}
          />
        </div>
      </DateStack>
      <BottomBar style={{ justifyContent: 'center', gap: 12 }}>
        <ClearAllBtn onClick={handleClear}>Clear</ClearAllBtn>
        <ClearAllBtn as="button" style={{ borderColor: '#aaa', color: '#444' }} onClick={onCancel}>Cancel</ClearAllBtn>
        <ClearAllBtn as="button" style={{ background: '#FF385C', color: '#fff', borderColor: '#FF385C' }} onClick={handleApply}>Apply</ClearAllBtn>
      </BottomBar>
    </div>
  );
};

export default DateRangeFilter; 