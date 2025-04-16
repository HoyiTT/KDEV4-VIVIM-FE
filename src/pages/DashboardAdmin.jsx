import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import { PieChart } from 'react-minimal-pie-chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardAdmin = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('대시보드');

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  // 도넛 차트 데이터 (건수 기반)
  const projectStatusData = [
    { title: '화면 설계', count: 385, color: '#B785DB' },
    { title: '디자인', count: 269, color: '#647ACB' },
    { title: '프로젝트 기획', count: 1, color: '#FFD572' },
    { title: '개발', count: 154, color: '#7BC86C' },
    { title: '검수', count: 115, color: '#8E6DA6' },
    { title: '배포', count: 115, color: '#8E6DA6' }
  ];

  // 비율 계산
  const chartData = useMemo(() => {
    const total = projectStatusData.reduce((sum, item) => sum + item.count, 0);
    return projectStatusData.map(item => ({
      ...item,
      value: Number(((item.count / total) * 100).toFixed(1))
    }));
  }, [projectStatusData]);

  // 프로젝트 현황 요약 데이터
  const summaryData = [
    { title: '계약', value: 212 },
    { title: '검수', value: 72 },

  ];

  // 승인요청 더미데이터 대신 관리자 문의 더미데이터 추가
  const adminInquiries = [
    {
      title: "프로젝트 권한 설정 문의",
      author: "김철수",
      company: "테크솔루션",
      date: "2024.03.21",
      status: "미답변"
    },
    {
      title: "결제 정보 변경 요청",
      author: "이영희",
      company: "디자인허브",
      date: "2024.03.21",
      status: "답변완료"
    },
    {
      title: "계정 접속 오류",
      author: "박지민",
      company: "웹스타트",
      date: "2024.03.20",
      status: "미답변"
    },
    {
      title: "데이터 복구 문의",
      author: "한소희",
      company: "디지털플러스",
      date: "2024.03.19",
      status: "답변완료"
    }
  ];

  // 최근 게시글 더미데이터 추가 (컴포넌트 상단에 추가)
  const recentPosts = [
    {
      title: "2024년 1분기 프로젝트 진행현황 보고",
      author: "김관리",
      date: "2024.03.21",
      category: "공지"
    },
    {
      title: "신규 프로젝트 관리 시스템 도입 안내",
      author: "이매니저",
      date: "2024.03.20",
      category: "일반"
    },
    {
      title: "3월 프로젝트 마감 일정 안내",
      author: "박팀장",
      date: "2024.03.19",
      category: "일반"
    },
    {
      title: "외부 협력사 미팅 결과 공유",
      author: "최대리",
      date: "2024.03.18",
      category: "공지"
    },
    {
      title: "프로젝트 진행 가이드라인 업데이트",
      author: "정과장",
      date: "2024.03.17",
      category: "질문"
    }
  ];

  // 매출 데이터 추가 (컴포넌트 내부)
  const revenueData = [
    { name: '1주차', amount: 2800 },
    { name: '2주차', amount: 3200 },
    { name: '3주차', amount: 2600 },
    { name: '4주차', amount: 3500 },
  ];

  return (
    <PageContainer>
      <Navbar 
        activeMenuItem={activeMenuItem}
        handleMenuClick={handleMenuClick}
      />
      <MainContent>
        <TopSection>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', width: '100%' }}>
            <SummarySection>
              <SectionTitle>프로젝트 진행 현황 요약</SectionTitle>
              <SummaryGrid>
                {summaryData.map((item, index) => (
                  <SummaryCard key={index}>
                    <SummaryTitle>{item.title}</SummaryTitle>
                    <SummaryValue>{item.value}</SummaryValue>
                  </SummaryCard>
                ))}
              </SummaryGrid>
            </SummarySection>

            <ChartSection>
              <SectionTitle>진행중인 단계별 프로젝트 비율</SectionTitle>
              <ChartWrapper>
                <ChartContainer>
                  <PieChart
                    data={chartData}
                    lineWidth={45}
                    paddingAngle={2}
                    label={({ dataEntry }) => `${dataEntry.value}%`}
                    labelStyle={{ 
                      fontSize: '5px',
                      fill: '#fff',
                      fontWeight: '500'
                    }}
                    labelPosition={80}
                  />
                </ChartContainer>
                <ChartLegend>
                  {chartData.map((item, index) => (
                    <LegendItem key={index}>
                      <LegendColor color={item.color} />
                      <LegendTextWrapper>
                        <LegendTitle>{item.title}</LegendTitle>
                        <LegendCount>
                          <span>{item.count}건</span>
                          <LegendPercent>({item.value}%)</LegendPercent>
                        </LegendCount>
                      </LegendTextWrapper>
                    </LegendItem>
                  ))}
                </ChartLegend>
              </ChartWrapper>
            </ChartSection>
          </div>

          <div style={{ display: 'flex', gap: '24px', width: '100%' }}>
            <InquirySection>
              <SectionTitle>관리자 문의</SectionTitle>
              <InquiryList>
                {adminInquiries.map((inquiry, index) => (
                  <InquiryItem key={index}>
                    <InquiryHeader>
                      <InquiryTitle>{inquiry.title}</InquiryTitle>
                      <InquiryStatus status={inquiry.status}>
                        {inquiry.status}
                      </InquiryStatus>
                    </InquiryHeader>
                    <InquiryInfo>
                      <CompanyInfo>
                        {inquiry.company} · {inquiry.author}
                      </CompanyInfo>
                      <InquiryDate>{inquiry.date}</InquiryDate>
                    </InquiryInfo>
                  </InquiryItem>
                ))}
              </InquiryList>
            </InquirySection>

            <RevenueSection>
              <TitleRow>
                <SectionTitle>이번 달 매출 현황</SectionTitle>
                <RevenueAmount>총 매출: {revenueData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}만원</RevenueAmount>
              </TitleRow>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString()}만원`, '매출']}
                    labelStyle={{ color: '#1e293b' }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#82a6dd"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </RevenueSection>
          </div>
        </TopSection>

        <RecentPostSection>
          <SectionTitle>최근 게시글</SectionTitle>
          <PostList>
            {recentPosts.map((post, index) => (
              <PostItem key={index}>
                <PostCategory>{post.category}</PostCategory>
                <PostTitle>{post.title}</PostTitle>
                <PostInfo>
                  <PostAuthor>{post.author}</PostAuthor>
                  <PostDate>{post.date}</PostDate>
                </PostInfo>
              </PostItem>
            ))}
          </PostList>
        </RecentPostSection>
      </MainContent>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const MainContent = styled.main`
  padding: 24px;
  margin: 60px auto 0;
  max-width: 1300px;
  width: calc(100% - 100px);
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
`;

const ChartSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 49%;
  height: 380px;
`;

const ChartWrapper = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 0;
  align-items: center;
  justify-content: center;
`;

const ChartContainer = styled.div`
  width: 260px;
  height: 260px;
  flex-shrink: 0;
  margin: 0;
`;

const ChartLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 0;
  min-width: 180px;
  padding: 0;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${props => props.color};
`;

const LegendTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const LegendTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
`;

const LegendCount = styled.div`
  font-size: 13px;
  color: #64748b;
`;

const LegendPercent = styled.span`
  color: #94a3b8;
  margin-left: 4px;
`;

const SummarySection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 49%;
  height: 380px;
`;

const SummaryGrid = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  height: calc(100% - 60px);
  margin-top: 20px;
  padding: 20px 0;
`;

const SummaryCard = styled.div`
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
  }
`;

const SummaryTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 10px;
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: #2E7D32;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;

  &::after {
    content: '건';
    font-size: 16px;
    color: #64748b;
  }
`;

const InquirySection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 49%;
  height: 420px;
`;

const InquiryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InquiryItem = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
`;

const InquiryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const InquiryTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
`;

const InquiryStatus = styled.span`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  ${props => {
    switch (props.status) {
      case '미답변':
        return `
          background-color: #FEF2F2;
          color: #EF4444;
        `;
      case '답변완료':
        return `
          background-color: #F0FDF4;
          color: #22C55E;
        `;
      case '검토중':
        return `
          background-color: #F0F9FF;
          color: #0EA5E9;
        `;
      default:
        return `
          background-color: #F8FAFC;
          color: #64748B;
        `;
    }
  }}
`;

const InquiryInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CompanyInfo = styled.span`
  font-size: 13px;
  color: #64748b;
`;

const InquiryDate = styled.span`
  font-size: 12px;
  color: #94a3b8;
`;

const RevenueSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 49%;
  height: 420px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const RevenueAmount = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #82a6dd;
  margin-bottom: 0;
`;

const RecentPostSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
`;

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PostItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  gap: 16px;
`;

const PostCategory = styled.span`
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
`;

const PostTitle = styled.span`
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
  flex: 1;
`;

const PostInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PostAuthor = styled.span`
  font-size: 13px;
  color: #64748b;
`;

const PostDate = styled.span`
  font-size: 13px;
  color: #94a3b8;
`;

export default DashboardAdmin;
