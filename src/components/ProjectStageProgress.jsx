import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaCheck, FaClock, FaPlus, FaArrowLeft, FaArrowRight, FaEdit, FaTrashAlt, FaEllipsisV } from 'react-icons/fa';

const StageProgressColumn = styled.div`
  flex: 1;
  min-width: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-height: 550px;
  overflow-y: auto;
  
  /* 화면 너비가 좁을 때 높이 제한 줄이기 */
  @media (max-width: 1024px) {
    max-height: 400px;
    width: 95%;
  }
`;

const StageProgressHeader = styled.div`
  margin-bottom: 20px;
`;

const StageProgressTimeline = styled.div`
  position: relative;
  padding: 0 10px;
`;

const TimelineBar = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #e2e8f0;
  z-index: 1;
`;

const StageProgressList = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
`;

const StageProgressItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
  cursor: pointer;
  ${props => props.active && `
    font-weight: bold;
  `}
`;

const StageProgressMarker = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.completed ? '#22c55e' : props.current ? '#3b82f6' : '#e2e8f0'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  svg {
    color: white;
    font-size: 20px;
  }
`;

const StageProgressDetails = styled.div`
  text-align: center;
`;

const StageProgressName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #334155;
  margin-bottom: 4px;
`;

const StageProgressStatus = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const StageProgressInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 32px;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 20px;
`;

const ProgressInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProgressInfoLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
`;

const ProgressInfoValue = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.width};
  height: 100%;
  background-color: #22c55e;
  border-radius: 2px;
`;

/**
 * 프로젝트 단계별 진행 상황을 타임라인으로 표시하는 컴포넌트
 * @param {Array} progressList - 프로젝트 단계 목록
 * @param {Number} currentStageIndex - 현재 선택된 단계 인덱스
 * @param {Function} setCurrentStageIndex - 단계 선택 시 호출되는 함수
 * @param {String} title - 타임라인 제목 (기본값: "프로젝트 진행 단계")
 * @param {Boolean} isAdmin - 관리자 여부
 * @param {Function} handleAddStage - 단계 추가 함수
 * @param {Function} openStageModal - 단계 추가 모달을 여는 함수
 */
const ProjectStageProgress = ({ 
  progressList, 
  currentStageIndex, 
  setCurrentStageIndex,
  title = "프로젝트 진행 단계",
  isAdmin = false,
  openStageModal
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  // 메뉴 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handlePrevStage = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(prev => prev - 1);
    }
  };
  
  const handleNextStage = () => {
    if (currentStageIndex < progressList.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
    }
  };

  // 현재 선택된 단계
  const currentStage = progressList[currentStageIndex];

  return (
    <StageProgressColumn>
      <StageProgressHeader>
        <HeaderContent>
          <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#334155' }}>
            {title}
          </h3>
          <StageActions>
            <StageNavigation>
              <NavButton 
                onClick={handlePrevStage} 
                disabled={currentStageIndex === 0}
              >
                <FaArrowLeft />
              </NavButton>
              <StageIndicator>
                {currentStageIndex + 1} / {progressList.length}
              </StageIndicator>
              <NavButton 
                onClick={handleNextStage} 
                disabled={currentStageIndex === progressList.length - 1}
              >
                <FaArrowRight />
              </NavButton>
            </StageNavigation>
            {isAdmin && (
              <ManageButtonContainer ref={menuRef}>
                <ManageButton onClick={() => setShowMenu(!showMenu)}>
                  <FaEllipsisV /> 단계 관리
                </ManageButton>
                {showMenu && (
                  <ManageDropdown>
                    <DropdownItem onClick={() => {
                      openStageModal('add');
                      setShowMenu(false);
                    }}>
                      <FaPlus /> 단계 추가
                    </DropdownItem>
                    {currentStage && (
                      <>
                        <DropdownItem onClick={() => {
                          openStageModal('edit', currentStage);
                          setShowMenu(false);
                        }}>
                          <FaEdit /> 현재 단계 수정
                        </DropdownItem>
                        <DropdownItem onClick={() => {
                          openStageModal('delete', currentStage);
                          setShowMenu(false);
                        }}>
                          <FaTrashAlt /> 현재 단계 삭제
                        </DropdownItem>
                      </>
                    )}
                  </ManageDropdown>
                )}
              </ManageButtonContainer>
            )}
          </StageActions>
        </HeaderContent>
      </StageProgressHeader>
      
      <StageProgressTimeline>
        <TimelineBar />
        <StageProgressList>
          {progressList.map((stage, index) => (
            <StageProgressItem 
              key={stage.id}
              onClick={() => setCurrentStageIndex(index)}
              active={index === currentStageIndex}
            >
              <StageProgressMarker 
                completed={index < currentStageIndex} 
                current={index === currentStageIndex}
              >
                {index < currentStageIndex ? <FaCheck /> : index === currentStageIndex ? <FaClock /> : index}
              </StageProgressMarker>
              <StageProgressDetails>
                <StageProgressName>{stage.name}</StageProgressName>
                <StageProgressStatus>
                  {index < currentStageIndex 
                    ? '완료' 
                    : index === currentStageIndex 
                      ? '진행 중' 
                      : '예정됨'}
                </StageProgressStatus>
              </StageProgressDetails>
            </StageProgressItem>
          ))}
        </StageProgressList>
      </StageProgressTimeline>
      
      <StageProgressInfo>
        <ProgressInfoItem>
          <ProgressInfoLabel>현재 단계</ProgressInfoLabel>
          <ProgressInfoValue>{progressList[currentStageIndex]?.name || '정보 없음'}</ProgressInfoValue>
        </ProgressInfoItem>
        <ProgressInfoItem>
          <ProgressInfoLabel>전체 진행률</ProgressInfoLabel>
          <ProgressBar>
            <ProgressFill width={`${progressList.length > 0 ? (currentStageIndex / progressList.length) * 100 : 0}%`} />
          </ProgressBar>
          <ProgressInfoValue>{progressList.length > 0 ? Math.round((currentStageIndex / progressList.length) * 100) : 0}%</ProgressInfoValue>
        </ProgressInfoItem>
      </StageProgressInfo>
    </StageProgressColumn>
  );
};

// 새로 추가된 스타일 컴포넌트
const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StageActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ManageButtonContainer = styled.div`
  position: relative;
`;

const ManageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const ManageDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 180px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 5px;
  z-index: 10;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8fafc;
  }

  svg {
    color: #64748b;
    font-size: 14px;
  }

  &:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

const StageNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button`
  padding: 6px 10px;
  background: ${props => props.disabled ? '#f1f5f9' : '#f8fafc'};
  color: ${props => props.disabled ? '#cbd5e1' : '#2563eb'};
  border: 1px solid ${props => props.disabled ? '#e2e8f0' : '#2563eb'};
  border-radius: 4px;
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.disabled ? '#f1f5f9' : '#f0f7ff'};
  }
`;

const StageIndicator = styled.span`
  font-size: 14px;
  color: #64748b;
`;

export default ProjectStageProgress; 