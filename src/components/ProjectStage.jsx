import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaCheck, FaClock, FaPlus, FaArrowLeft, FaArrowRight, FaEdit, FaTrashAlt, FaEllipsisV } from 'react-icons/fa';

const StageProgressColumn = styled.div`
  flex: 1;
  min-width: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px 30px 20px 20px;
  max-height: none;
  overflow-y: visible;
  overflow-x: visible;
  position: relative;
  
  /* 화면 너비가 좁을 때 너비 조정 */
  @media (max-width: 1024px) {
    width: 100%;
    padding: 15px 35px 15px 15px;
  }
  
  /* 모바일 환경에서 패딩 증가 */
  @media (max-width: 768px) {
    padding: 15px 40px 15px 15px;
  }
`;

const StageProgressHeader = styled.div`
  margin-bottom: 20px;
`;

const StageProgressTimeline = styled.div`
  position: relative;
  padding: 0 10px;
  margin-top: 50px;
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
  overflow-x: visible;
  padding: 0 20px;
  /* 모바일 환경에서 스크롤 가능하도록 설정 */
  @media (max-width: 768px) {
    overflow-x: auto;
    justify-content: flex-start;
    gap: 30px;
    padding-bottom: 10px;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      height: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
  }
`;

const StageProgressItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
  cursor: pointer;
  flex-shrink: 0;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s ease-in-out;
  position: relative;
  
  ${props => props.active && `
    &::before {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 2px;
      background-color: #3b82f6;
      border-radius: 2px;
    }
  `}

  &:hover {
    background-color: rgba(59, 130, 246, 0.02);
  }
`;

const StageProgressMarker = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: ${props => {
    if (props.completed) return '#22c55e';
    if (props.current) return '#3b82f6';
    return '#e2e8f0';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: ${props => 
    props.viewing 
      ? '0 0 0 2px #fff, 0 0 0 4px #3b82f6' 
      : '0 2px 4px rgba(0, 0, 0, 0.1)'
  };
  transition: all 0.2s ease-in-out;
  
  svg {
    color: white;
    font-size: 18px;
  }

  ${props => props.viewing && `
    transform: scale(1.05);
  `}
`;

const StageProgressDetails = styled.div`
  text-align: center;
  width: 100%;
  max-width: 120px;
`;

const StageProgressName = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: #1e293b;
  margin-bottom: 4px;
  word-break: keep-all;
  overflow-wrap: break-word;
  max-width: 120px;
  text-align: center;
  line-height: 1.4;
  letter-spacing: -0.3px;
`;

const StageProgressStatus = styled.div`
  font-size: 12px;
  color: ${props => {
    if (props.isCompleted) return '#16a34a';
    if (props.isCurrent) return '#3b82f6';
    return '#64748b';
  }};
  font-weight: ${props => (props.isCompleted || props.isCurrent) ? '600' : 'normal'};
  background-color: ${props => {
    if (props.isCompleted) return '#dcfce7';
    if (props.isCurrent) return '#dbeafe';
    return 'transparent';
  }};
  padding: 2px 8px;
  border-radius: 4px;
`;

const StageProgressInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  small {
    font-size: 12px;
    text-align: center;
  }
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
 * @param {Function} openStageModal - 단계 추가 모달을 여는 함수
 * @param {Object} projectProgress - 프로젝트 전체 진행률 정보
 * @param {Object} progressStatus - 프로젝트 단계별 진척도 정보
 */
const ProjectStageProgress = ({ 
  progressList, 
  currentStageIndex, 
  setCurrentStageIndex,
  title = "프로젝트 진행 단계",
  isAdmin = false,
  openStageModal,
  projectProgress = {
    totalStageCount: 0,
    completedStageCount: 0,
    currentStageProgressRate: 0,
    overallProgressRate: 0
  },
  progressStatus = {
    progressList: []
  },
  children
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
          {progressList.map((stage, index) => {
            const stageStatus = progressStatus.progressList.find(
              status => status.progressId === stage.id
            ) || {
              totalApprovalCount: 0,
              approvedApprovalCount: 0,
              progressRate: 0,
              isCompleted: false
            };
            
            const isCompleted = stageStatus.isCompleted;
            const isCurrent = !isCompleted && index === projectProgress.completedStageCount;
            const isViewing = index === currentStageIndex;
            
            return (
              <StageProgressItem 
                key={stage.id}
                onClick={() => setCurrentStageIndex(index)}
                active={isViewing}
              >
                <StageProgressMarker 
                  completed={isCompleted}
                  current={isCurrent}
                  viewing={isViewing}
                >
                  {isCompleted ? 
                    <FaCheck /> : 
                    isCurrent ? <FaClock /> : index + 1
                  }
                </StageProgressMarker>
                <StageProgressDetails>
                  <StageProgressName>{stage.name}</StageProgressName>
                  <StageProgressStatus 
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                  >
                    {isCompleted ? '완료' : 
                     isCurrent ? '진행 중' : 
                     '예정됨'}
                  </StageProgressStatus>
                </StageProgressDetails>
              </StageProgressItem>
            );
          })}
        </StageProgressList>
      </StageProgressTimeline>
      
      <StageProgressInfo>
        <ProgressInfoItem>
          <ProgressInfoLabel>현재 단계</ProgressInfoLabel>
          <ProgressInfoValue>
            {progressList[currentStageIndex]?.name || '정보 없음'}
            {(() => {
              const currentStage = progressList[currentStageIndex];
              const stageStatus = currentStage 
                ? progressStatus.progressList.find(status => status.progressId === currentStage.id)
                : null;
              
              if (stageStatus?.isCompleted) {
                return <small style={{ color: '#16a34a' }}>(완료)</small>;
              } else if (currentStageIndex === projectProgress.completedStageCount) {
                return <small style={{ color: '#3b82f6' }}>(진행 중)</small>;
              }
              return null;
            })()}
          </ProgressInfoValue>
        </ProgressInfoItem>
        <ProgressInfoItem>
          <ProgressInfoLabel>현재 단계 승인 비율</ProgressInfoLabel>
          {(() => {
            const currentStage = progressList[currentStageIndex];
            const stageStatus = currentStage 
              ? progressStatus.progressList.find(status => status.progressId === currentStage.id)
              : null;
              
            if (!stageStatus || stageStatus.totalApprovalCount === 0) {
              return <ProgressInfoValue>승인요청 없음</ProgressInfoValue>;
            }

            const progressPercent = Math.round((stageStatus.approvedApprovalCount / stageStatus.totalApprovalCount) * 100);
            const isStageCompleted = progressPercent === 100;
            
            return (
              <>
                <ProgressBar>
                  <ProgressFill 
                    width={`${progressPercent}%`}
                    style={{
                      backgroundColor: isStageCompleted ? '#22c55e' : '#3b82f6'
                    }}
                  />
                </ProgressBar>
                <ProgressInfoValue>
                  <div style={{ 
                    color: isStageCompleted ? '#16a34a' : '#1e293b',
                    fontWeight: isStageCompleted ? '600' : '500'
                  }}>
                    {progressPercent}%
                  </div>
                  <small style={{ 
                    color: isStageCompleted ? '#16a34a' : '#64748b',
                    fontWeight: isStageCompleted ? '600' : 'normal'
                  }}>
                    {stageStatus.approvedApprovalCount}/{stageStatus.totalApprovalCount} 승인완료
                    {isStageCompleted && ' (단계 완료)'}
                  </small>
                </ProgressInfoValue>
              </>
            );
          })()}
        </ProgressInfoItem>
        <ProgressInfoItem>
          <ProgressInfoLabel>전체 진행률</ProgressInfoLabel>
          {(() => {
            // 현재까지의 완료된 단계 수 계산
            const completedStages = progressStatus.progressList.reduce((count, status, index) => {
              const isCompleted = status.totalApprovalCount > 0 && 
                                status.approvedApprovalCount === status.totalApprovalCount;
              return isCompleted ? count + 1 : count;
            }, 0);

            // 전체 진행률 계산 (단계 단위로)
            const totalStages = progressStatus.progressList.length;
            const overallProgress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

            return (
              <>
                <ProgressBar>
                  <ProgressFill width={`${overallProgress}%`} />
                </ProgressBar>
                <ProgressInfoValue>
                  {Math.round(overallProgress)}% 
                  <small>
                    ({completedStages}/{totalStages} 단계 완료)
                  </small>
                </ProgressInfoValue>
              </>
            );
          })()}
        </ProgressInfoItem>
      </StageProgressInfo>
      
      <ApprovalRequestContainer>
        {children}
      </ApprovalRequestContainer>
    </StageProgressColumn>
  );
};

// 스타일 컴포넌트 순서 변경 - StageActions를 먼저 정의
const StageActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    
    h3 {
      margin-bottom: 5px;
    }
    
    ${StageActions} {
      width: 100%;
      justify-content: space-between;
    }
  }
`;

const ManageButtonContainer = styled.div`
  position: relative;
  
  @media (max-width: 768px) {
    margin-top: 8px;
  }
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
  white-space: nowrap;

  &:hover {
    background-color: #1d4ed8;
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 13px;
  }
`;

const ManageDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 180px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 5px;
  z-index: 1000;
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
    flex-shrink: 0;
  }

  &:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 13px;
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

// 추가된 스타일 컴포넌트
const ApprovalRequestContainer = styled.div`
  margin-top: 24px;
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
`;

// 모듈의 마지막에 export 구문 배치
export default ProjectStageProgress; 
