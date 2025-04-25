import React from 'react';
import styled from 'styled-components';
import { FaCheck, FaClock } from 'react-icons/fa';

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
    width: 100%;
  }
`;

const StageProgressHeader = styled.div`
  margin-bottom: 20px;
`;

const StageProgressTimeline = styled.div`
  position: relative;
  margin: 30px 0;
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
 */
const ProjectStageProgress = ({ 
  progressList, 
  currentStageIndex, 
  setCurrentStageIndex,
  title = "프로젝트 진행 단계"
}) => {
  return (
    <StageProgressColumn>
      <StageProgressHeader>
        <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#334155' }}>
          {title}
        </h3>
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

export default ProjectStageProgress; 