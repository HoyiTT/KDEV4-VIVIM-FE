import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const SelectContainer = styled.div`
  position: relative;
  width: 240px;
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  color: ${props => props.value ? '#1e293b' : '#64748b'};
  
  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.15);
  }

  &::after {
    content: '';
    width: 16px;
    height: 16px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    transition: transform 0.2s;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const OptionsContainer = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 240px;
  overflow-y: auto;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-8px)'};
  transition: all 0.2s ease;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const Option = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  color: ${props => props.isFirst ? '#64748b' : '#1e293b'};
  font-size: 14px;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: #f8fafc;
  }

  &:active {
    background-color: #f1f5f9;
  }

  ${props => props.isSelected && `
    background-color: #f0fdf4;
    color: #2E7D32;
    font-weight: 500;
  `}
`;

const Select = ({ value, onChange, children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  const selectedOption = React.Children.toArray(children).find(
    child => child.props.value === value
  );

  return (
    <SelectContainer ref={containerRef}>
      <SelectButton
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
        value={value}
        {...props}
      >
        {selectedOption ? selectedOption.props.children : '선택하세요'}
      </SelectButton>
      <OptionsContainer isOpen={isOpen}>
        {React.Children.map(children, (child, index) => (
          <Option
            key={child.props.value}
            onClick={() => handleSelect(child.props.value)}
            isFirst={index === 0}
            isSelected={child.props.value === value}
          >
            {child.props.children}
          </Option>
        ))}
      </OptionsContainer>
    </SelectContainer>
  );
};

export default Select; 