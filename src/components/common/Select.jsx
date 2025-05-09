import React from 'react';
import styled from 'styled-components';

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.div`
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  &:focus {
    outline: none;
    border-color: #2E7D32;
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.15);
  }
`;

const OptionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Option = styled.div`
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$isSelected ? '#f1f5f9' : 'white'};
  color: ${props => props.$isSelected ? '#2E7D32' : '#1e293b'};
  font-weight: ${props => props.$isSelected ? '500' : 'normal'};
  
  &:hover {
    background: #f8fafc;
  }
  
  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const Select = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = '선택하세요' 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState(
    options?.find(option => option.value === value) || null
  );

  React.useEffect(() => {
    if (options) {
      setSelectedOption(options.find(option => option.value === value) || null);
    }
  }, [value, options]);

  const handleSelect = (option) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <SelectContainer>
      <SelectButton onClick={() => setIsOpen(!isOpen)}>
        {selectedOption ? selectedOption.label : placeholder}
      </SelectButton>
      {isOpen && options && options.length > 0 && (
        <OptionsContainer>
          {options.map((option, index) => (
            <Option
              key={option.value}
              onClick={() => handleSelect(option)}
              $isSelected={option.value === value}
            >
              {option.label}
            </Option>
          ))}
        </OptionsContainer>
      )}
    </SelectContainer>
  );
};

export default Select; 