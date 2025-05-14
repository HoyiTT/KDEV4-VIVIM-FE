import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaCheck, FaClock, FaPlus, FaArrowLeft, FaArrowRight, FaEdit, FaTrashAlt, FaEllipsisV, FaArrowUp, FaArrowDown, FaGripVertical } from 'react-icons/fa';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ApprovalProposal from './ApprovalProposal';
import { useAuth } from '../hooks/useAuth';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosInstance';
import ConfirmModal from './common/ConfirmModal';

// currentProgress 열거형 값과 단계 이름 매핑
const PROGRESS_STAGE_MAP = {
  '요구사항 정의': 'REQUIREMENTS',
  '화면설계': 'WIREFRAME',
  '디자인': 'DESIGN',
  '퍼블리싱': 'PUBLISHING',
  '개발': 'DEVELOPMENT',
  '검수': 'INSPECTION',
  '완료': 'COMPLETED'
};

// currentProgress 열거형 값과 단계 이름 매핑 (역방향)
const REVERSE_PROGRESS_STAGE_MAP = {
  'REQUIREMENTS': '요구사항 정의',
  'WIREFRAME': '화면설계',
  'DESIGN': '디자인',
  'PUBLISHING': '퍼블리싱',
  'DEVELOPMENT': '개발',
  'INSPECTION': '검수',
  'COMPLETED': '완료'
};

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

const StageProgressTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #334155;
`;

const StageProgressTimeline = styled.div`
  position: relative;
  padding: 0 10px;
  margin-top: 50px;
`;

const TimelineBar = styled.div`
  position: absolute;
  top: 25px;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #e2e8f0;
  z-index: 1;
  border-radius: 2px;
  overflow: hidden;
`;

const TimelineProgress = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.width}%;
  background-color: #2E7D32;
  transition: width 0.3s ease-in-out;
`;

const StageProgressList = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
  padding: 0 4px;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  @media (max-width: 768px) {
    padding: 0 2px;
    gap: 10px;
  }
`;

const StageProgressItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 110px;
  cursor: pointer;
  flex-shrink: 0;
  padding: 10px;
  border-radius: 12px;
  transition: all 0.2s ease-in-out;
  position: relative;
  background-color: ${props => props['data-active'] === 'true' ? 'rgba(59, 130, 246, 0.02)' : 'transparent'};

  &:hover {
    background-color: rgba(59, 130, 246, 0.02);
  }
`;

const StageProgressMarker = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: ${props => {
    if (props['data-completed'] === 'true') return '#2E7D32';
    if (props['data-current'] === 'true') return '#3b82f6';
    return '#e2e8f0';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: ${props => 
    props['data-viewing'] === 'true'
      ? '0 0 0 2px #fff, 0 0 0 4px #2E7D32' 
      : '0 2px 4px rgba(0, 0, 0, 0.1)'
  };
  
  svg {
    color: white;
    font-size: 18px;
  }
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
    if (props['data-completed'] === 'true') return '#16a34a';
    if (props['data-current'] === 'true') return '#3b82f6';
    return '#64748b';
  }};
  font-weight: 500;
  letter-spacing: -0.2px;
  opacity: 1;
  text-align: center;
`;

const StageProgressInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 24px;
  margin-bottom: 24px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -24px;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #e2e8f0;
  }
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
  background-color: ${props => props.color || '#2E7D32'};
  border-radius: 2px;
`;

const SortableItem = ({ id, name, targetIndex }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SortableStageItem ref={setNodeRef} style={style}>
      <DragHandle {...attributes} {...listeners}>
        <FaGripVertical />
      </DragHandle>
      <StageItemContent>
        <StageItemName>{name}</StageItemName>
        <StageItemPosition>{targetIndex}번째</StageItemPosition>
      </StageItemContent>
    </SortableStageItem>
  );
};

/**
 * 프로젝트 단계별 진행 상황을 타임라인으로 표시하는 컴포넌트
 * @param {Array} progressList - 프로젝트 단계 목록
 * @param {Number} currentStageIndex - 현재 선택된 단계 인덱스
 * @param {Function} setCurrentStageIndex - 단계 선택 시 호출되는 함수
 * @param {String} title - 타임라인 제목 (기본값: "프로젝트 진행 단계")
 * @param {Boolean} isDeveloperManager - 개발 매니저 여부
 * @param {Function} openStageModal - 단계 추가 모달을 여는 함수
 * @param {Object} projectProgress - 프로젝트 전체 진행률 정보
 * @param {Object} progressStatus - 프로젝트 단계별 진척도 정보
 */
const ProjectStageProgress = ({ 
  progressList, 
  currentStageIndex, 
  setCurrentStageIndex,
  title = "프로젝트 진행 단계",
  isDeveloperManager = false,
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
  onIncreaseProgress,
  currentProgress,
  projectId,
  children
}) => {
  const { isAdmin, isClient } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isModifyingPosition, setIsModifyingPosition] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [stages, setStages] = useState([]);
  const [currentStageApprovalCount, setCurrentStageApprovalCount] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (progressList) {
      setStages(progressList.map(stage => ({
        id: stage.id,
        name: stage.name,
        position: stage.position
      })));
    }
  }, [progressList]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = stages.findIndex(item => item.id === active.id);
      const newIndex = stages.findIndex(item => item.id === over.id);
      
      // 드래그된 아이템의 새로운 위치로 API 호출
      try {
        await axiosInstance.put(
          API_ENDPOINTS.PROJECT_PROGRESS_POSITION(projectId, active.id),
          { targetIndex: newIndex }
        );
        
        // 성공적으로 위치가 변경되면 로컬 상태 업데이트
        setStages((items) => {
          const newItems = arrayMove(items, oldIndex, newIndex);
          return newItems.map((item, index) => ({
            ...item,
            position: index + 1
          }));
        });
      } catch (error) {
        console.error('단계 순서 변경 중 오류 발생:', error);
        alert('단계 순서 변경에 실패했습니다.');
      }
    }
  };

  const handleSavePositions = async () => {
    if (isModifyingPosition) return;
    
    try {
      setIsModifyingPosition(true);
      
      // 각 단계의 새로운 위치를 순차적으로 업데이트
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        await axiosInstance.put(
          API_ENDPOINTS.PROJECT_PROGRESS_POSITION(projectId, stage.id),
          { targetIndex: i }
        );
      }
      
      alert('단계 순서가 성공적으로 변경되었습니다.');
      setShowPositionModal(false);
    } catch (error) {
      console.error('단계 순서 변경 중 오류 발생:', error);
      alert('단계 순서 변경에 실패했습니다.');
    } finally {
      setIsModifyingPosition(false);
    }
  };

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

  // 컴포넌트 마운트 시 사용자 역할 확인
  useEffect(() => {
    // checkUserRole 함수 호출 제거
  }, []);

  // 초기 로딩 시 isCurrent 단계 찾아서 선택
  useEffect(() => {
    if (progressList && progressList.length > 0) {
      const currentStageIndex = progressList.findIndex((stage) => {
        const stageStatus = progressStatus.progressList.find(
          status => status.progressId === stage.id
        ) || {
          totalApprovalCount: 0,
          approvedApprovalCount: 0,
          progressRate: 0,
          isCompleted: false
        };
        
        const currentStageName = REVERSE_PROGRESS_STAGE_MAP[currentProgress] || '';
        return !stageStatus.isCompleted && stage.name === currentStageName;
      });

      if (currentStageIndex !== -1) {
        setCurrentStageIndex(currentStageIndex);
      }
    }
  }, []); // 빈 의존성 배열로 초기 마운트 시에만 실행

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

  const currentStage = progressList[currentStageIndex];

  const getCurrentStageStatus = (stage, index) => {
    if (!stage) return { isCurrent: false, isCompleted: false };
    
    const stageStatus = progressStatus.progressList.find(
      status => status.progressId === stage.id
    ) || {
      totalApprovalCount: 0,
      approvedApprovalCount: 0,
      progressRate: 0,
      isCompleted: false
    };
    
    const currentStageName = REVERSE_PROGRESS_STAGE_MAP[currentProgress] || '';
    const isCurrent = !stageStatus.isCompleted && stage.name === currentStageName;
    
    // 승인요청이 1개 이상이고, 모든 승인요청이 완료된 경우 완료 상태로 설정
    const isCompleted = stageStatus.totalApprovalCount > 0 && 
                       stageStatus.approvedApprovalCount === stageStatus.totalApprovalCount;
    
    return { isCurrent, isCompleted };
  };

  const handleIncreaseProgress = async () => {
      if (isIncreasing) return;
      try {
        setIsIncreasing(true);
        const { data } = await axiosInstance.put(
           API_ENDPOINTS.PROJECT_PROGRESS(projectId)
        );
        onIncreaseProgress(data.currentProgress);
      } catch (error) {
          console.error('단계 승급 에러:', error);
          alert('진행 단계 업데이트에 실패했습니다.');
      } finally {  
          setIsIncreasing(false);
      }
      };

  // 데이터 로딩 상태 체크
  const isLoading = !progressList || progressList.length === 0 || !progressStatus || !progressStatus.progressList;

  const handleShowMore = () => {
    setShowMore(!showMore);
  };

  // 현재 단계의 승인요청 개수를 확인하는 함수 추가
  const getCurrentStageApprovalCount = async (stageId) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.APPROVAL.LIST(stageId), {
        withCredentials: true
      });
      return data.approvalList?.length || 0;
    } catch (error) {
      console.error('승인요청 개수 조회 실패:', error);
      return 0;
    }
  };

  // 현재 단계가 변경될 때마다 승인요청 개수 조회
  useEffect(() => {
    if (currentStage) {
      getCurrentStageApprovalCount(currentStage.id).then(count => {
        setCurrentStageApprovalCount(count);
      });
    }
  }, [currentStage]);

  if (isLoading) {
    return (
      <StageProgressColumn>
        <StageProgressHeader>
          <HeaderContent>
            <StageProgressTitle>{title}</StageProgressTitle>
          </HeaderContent>
        </StageProgressHeader>
        <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
      </StageProgressColumn>
    );
  }

  return (
    <StageProgressColumn>
      <StageProgressHeader>
        <HeaderContent>
          <StageProgressTitle>{title}</StageProgressTitle>
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
            {(isAdmin || isDeveloperManager)  && (
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
                    <DropdownItem onClick={() => {
                      openStageModal('editPosition');
                      setShowMenu(false);
                    }}>
                      <FaGripVertical /> 단계 순서 변경
                    </DropdownItem>
                    {currentStage && (
                      <>
                        <DropdownItem onClick={() => {
                          openStageModal('editName', currentStage);
                          setShowMenu(false);
                        }}>
                          <FaEdit /> 현재 단계명 수정
                        </DropdownItem>
                        {currentStageApprovalCount === 0 && (
                          <DropdownItem onClick={() => {
                            openStageModal('delete', currentStage);
                            setShowMenu(false);
                          }}>
                            <FaTrashAlt /> 현재 단계 삭제
                          </DropdownItem>
                        )}
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
        <TimelineBar>
          <TimelineProgress width={projectProgress.overallProgressRate} />
        </TimelineBar>
        <StageProgressList>
          {progressList.map((stage, index) => {
            const { isCurrent, isCompleted } = getCurrentStageStatus(stage, index);
            const isViewing = index === currentStageIndex;
            
            return (
              <StageProgressItem 
                key={stage.id}
                onClick={() => setCurrentStageIndex(index)}
                data-active={isViewing.toString()}
              >
                <StageProgressMarker 
                  data-completed={isCompleted.toString()}
                  data-current={isCurrent.toString()}
                  data-viewing={isViewing.toString()}
                >
                  {isCompleted ? 
                    <FaCheck /> : 
                    isCurrent ? <FaClock /> : index + 1
                  }
                </StageProgressMarker>
                <StageProgressDetails>
                  <StageProgressName>{stage.name}</StageProgressName>
                  <StageProgressStatus 
                    data-completed={isCompleted.toString()}
                    data-current={isCurrent.toString()}
                  >
                    {isCompleted ? '완료' : 
                     isCurrent ? '진행중' : 
                     '대기'}
                  </StageProgressStatus>
                </StageProgressDetails>
              </StageProgressItem>
            );
          })}
        </StageProgressList>
      </StageProgressTimeline>
      
      <ApprovalRequestContainer>
        <StageProgressInfo>
          <ProgressInfoItem>
            <ProgressInfoLabel>현재 단계</ProgressInfoLabel>
              <ProgressInfoValue>
                {progressList[currentStageIndex]?.name || '없음'}
                {(() => {
                  const currentStage = progressList[currentStageIndex];
                  if (!currentStage) return null;
                  
                  const { isCurrent, isCompleted } = getCurrentStageStatus(currentStage, currentStageIndex);
                  
                  if (isCompleted) {
                    return <small style={{ color: '#2E7D32' }}>완료</small>;
                  } else if (isCurrent) {
                    return <small style={{ color: '#3b82f6' }}>진행중</small>;
                  } else {
                    return <small style={{ color: '#64748b' }}>대기</small>;
                  }
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
                
                return (
                  <>
                    <ProgressBar>
                      <ProgressFill 
                        width={`${progressPercent}%`}
                        color={stageStatus.isCompleted ? '#2E7D32' : '#2E7D32'}
                      />
                    </ProgressBar>
                    <ProgressInfoValue>
                      {progressPercent}%
                      <small>
                        {stageStatus.approvedApprovalCount}/{stageStatus.totalApprovalCount}
                      </small>
                    </ProgressInfoValue>
                  </>
                );
              })()}
          </ProgressInfoItem>
          <ProgressInfoItem>
            <ProgressInfoLabel>전체 진행률</ProgressInfoLabel>
            <ProgressBar>
              <ProgressFill 
                width={`${(() => {
                  const totalStages = Object.keys(REVERSE_PROGRESS_STAGE_MAP).length;
                  const currentStageIndex = Object.keys(REVERSE_PROGRESS_STAGE_MAP).indexOf(currentProgress);
                  return (currentStageIndex / (totalStages - 1)) * 100;
                })()}%`}
                color="#2E7D32"
              />
            </ProgressBar>
            <ProgressInfoValue>
              {(() => {
                const totalStages = Object.keys(REVERSE_PROGRESS_STAGE_MAP).length;
                const currentStageIndex = Object.keys(REVERSE_PROGRESS_STAGE_MAP).indexOf(currentProgress);
                return Math.round((currentStageIndex / (totalStages - 1)) * 100);
              })()}%
              <small>
                {Object.keys(REVERSE_PROGRESS_STAGE_MAP).indexOf(currentProgress) + 1}/{Object.keys(REVERSE_PROGRESS_STAGE_MAP).length} 단계
              </small>
            </ProgressInfoValue>
            {(isAdmin==true || isClient==true) && 
              currentProgress === PROGRESS_STAGE_MAP[progressList[currentStageIndex]?.name] &&
              progressStatus.progressList.find(status => status.progressId === progressList[currentStageIndex]?.id)?.progressRate === 100 && (
              <IncreaseProgressButton onClick={handleIncreaseProgress}>
                단계 승급
              </IncreaseProgressButton>
            )}
          </ProgressInfoItem>
        </StageProgressInfo>
        {progressList[currentStageIndex] && (
          <ApprovalProposal 
            progressId={progressList[currentStageIndex].id}
            projectId={projectId}
            showMore={showMore}
            onShowMore={handleShowMore}
            progressStatus={progressStatus}
          />
        )}
      </ApprovalRequestContainer>
      {showPositionModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h2>단계 순서 변경</h2>
            </ModalHeader>
            <ModalBody>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={progressList.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <StageList>
                    {progressList.map((stage) => (
                      <SortableItem
                        key={stage.id}
                        id={stage.id}
                        name={stage.name}
                        position={stage.position}
                        component={SortableStageItem}
                      />
                    ))}
                  </StageList>
                </SortableContext>
              </DndContext>
            </ModalBody>
            <ModalFooter>
              <ActionButton onClick={handleSavePositions}>
                순서 저장
              </ActionButton>
              <CancelButton onClick={() => setShowPositionModal(false)}>
                취소
              </CancelButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
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
  background-color: #2E7D32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #2E7D32;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f8fafc;
    color: #1e293b;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const StageIndicator = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

const ApprovalRequestContainer = styled.div`
  margin-top: 24px;
`;

const IncreaseProgressButton = styled.button`
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2E7D32;
  }
`;

const SortableStageItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: grab;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
  }
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: #64748b;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const StageItemContent = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const StageItemName = styled.div`
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
`;

const StageItemPosition = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  
  &:hover {
    color: #1e293b;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const DragInstructions = styled.div`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
`;

const StageList = styled.div`
  margin-bottom: 20px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background-color: #2E7D32;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #2E7D32;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  background-color: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e2e8f0;
    color: #1e293b;
  }
`;

export default ProjectStageProgress;