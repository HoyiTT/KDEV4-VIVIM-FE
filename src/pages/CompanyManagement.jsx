import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import axiosInstance from '../utils/axiosInstance';
import MainContent from '../components/common/MainContent';
import Select from '../components/common/Select';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import { FaSearch } from 'react-icons/fa';

const CompanyManagement = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({
    name: '',
    businessNumber: '',
    email: '',
    isDeleted: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, [currentPage]);

  const handleDeleteClick = (companyId) => {
    setCompanyToDelete(companyId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (companyToDelete) {
      try {
        await axiosInstance.delete(API_ENDPOINTS.COMPANY_DETAIL(companyToDelete), {
          withCredentials: true
        });
        fetchCompanies();
      } catch (error) {
        console.error('Error deleting company:', error);
        alert('회사 삭제 중 오류가 발생했습니다.');
      }
    }
    setDeleteModalOpen(false);
    setCompanyToDelete(null);
  };

  const fetchCompanies = async (customFilters = filters, page = currentPage) => {
    try {
      setLoading(true);
      // 필터가 모두 비어있으면 page/size만, 아니면 필터 파라미터 추가
      const hasActiveFilter = Object.values(customFilters).some(
        v => v !== '' && v !== false
      );
      let queryParams = '';
      if (hasActiveFilter) {
        const activeFilters = Object.entries(customFilters).reduce((acc, [key, value]) => {
          if (value !== '' && value !== false) {
            acc[key] = value;
          }
          return acc;
        }, {});
        queryParams = new URLSearchParams({
          ...activeFilters,
          page,
          size: 10
        }).toString();
      } else {
        queryParams = new URLSearchParams({
          page,
          size: 10
        }).toString();
      }
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.COMPANIES_SEARCH}?${queryParams}`);
      setCompanies(data.content || []);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchCompanies(filters, 0);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'ADMIN':
        return '관리자';
      case 'DEVELOPER':
        return '개발사';
      case 'CUSTOMER':
        return '고객사';
      default:
        return role;
    }
  };

  // 페이지 변경 시
  useEffect(() => {
    fetchCompanies(filters, currentPage);
  }, [currentPage]);

  return (
    <PageContainer>
      <MainContent>
        <Card>
          <Header>
            <PageTitle>회사 관리</PageTitle>
            <ButtonContainer>
              <AddButton onClick={() => navigate('/company-create')}>
                새 회사 등록
              </AddButton>
            </ButtonContainer>
          </Header>

          <SearchSection>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <SearchInput
                type="text"
                placeholder="회사명 검색"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
              />
              <SearchInput
                type="text"
                placeholder="사업자등록번호 검색"
                name="businessNumber"
                value={filters.businessNumber}
                onChange={handleFilterChange}
              />
              <SearchInput
                type="text"
                placeholder="이메일 검색"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
              />
              <SearchCheckbox>
                <input
                  type="checkbox"
                  checked={filters.isDeleted}
                  name="isDeleted"
                  onChange={handleFilterChange}
                />
                삭제된 회사만 검색
              </SearchCheckbox>
            </div>
            <div>
              <SearchButton onClick={handleSearch}>
                검색
              </SearchButton>
            </div>
          </SearchSection>
        </Card>

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : (
          <>
            <CompanyTable>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>회사명</TableHeaderCell>
                  <TableHeaderCell>사업자등록번호</TableHeaderCell>
                  <TableHeaderCell>대표자</TableHeaderCell>
                  <TableHeaderCell>연락처</TableHeaderCell>
                  <TableHeaderCell>역할</TableHeaderCell>
                  <TableHeaderCell>관리</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies && companies.length > 0 ? (
                  companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell 
                        onClick={() => navigate(`/company-edit/${company.id}`)}
                        style={{ cursor: 'pointer', color: '#1e293b' }}
                      >
                        {company.name}
                      </TableCell>
                      <TableCell>{company.businessNumber}</TableCell>
                      <TableCell>{company.coOwner}</TableCell>
                      <TableCell>{company.phone}</TableCell>
                      <TableCell>
                        <RoleBadge role={company.companyRole}>
                          {getRoleName(company.companyRole)}
                        </RoleBadge>
                      </TableCell>
                      <TableCell>
                        <ActionButtonContainer>
                          <ActionButton onClick={() => navigate(`/company-edit/${company.id}`)}>
                            수정
                          </ActionButton>
                          <DeleteButton onClick={() => handleDeleteClick(company.id)}>
                            삭제
                          </DeleteButton>
                        </ActionButtonContainer>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="6" style={{ textAlign: 'center' }}>
                      등록된 회사가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </CompanyTable>

            {companies.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalElements={totalPages * 10}
                pageSize={10}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="회사 삭제"
          message={`정말로 이 회사를 삭제하시겠습니까?
삭제된 회사는 복구할 수 없습니다.`}
          confirmText="삭제"
          cancelText="취소"
          type="delete"
        />
      </MainContent>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`;

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  letter-spacing: -0.01em;

  &::before {
    content: '';
    display: block;
    width: 3px;
    height: 20px;
    background: #2E7D32;
    border-radius: 1.5px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const AddButton = styled.button`
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
  
  &:before {
    content: '+';
    font-size: 18px;
    font-weight: 400;
  }

  &:hover {
    background: #1B5E20;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SearchSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  margin-bottom: 24px;
  overflow-x: auto;
  gap: 0;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 140px;
  min-width: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  &::placeholder {
    color: #94a3b8;
  }
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

const SearchCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #2E7D32;
  }
`;

const SearchButton = styled.button`
  padding: 10px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);

  &:hover {
    background: #1B5E20;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CompanyTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  margin: 0 auto;
`;

const TableHeader = styled.thead`
  background: white;
`;

const TableBody = styled.tbody``;

const TableHeaderCell = styled.th`
  padding: 16px 24px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #0F172A;
  border-bottom: 1px solid #e2e8f0;
  font-family: 'SUIT', sans-serif;
`;

const TableRow = styled.tr`
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #0F172A;
  border-bottom: 1px solid #e2e8f0;
  font-family: 'SUIT', sans-serif;
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.02em;
  transition: all 0.15s ease;
  background: ${props => {
    switch (props.role) {
      case 'ADMIN': return '#E2E8F0';
      case 'DEVELOPER': return '#E0F2FE';
      case 'CUSTOMER': return '#F0FDF4';
      default: return '#F1F5F9';
    }
  }};
  color: ${props => {
    switch (props.role) {
      case 'ADMIN': return '#475569';
      case 'DEVELOPER': return '#0369A1';
      case 'CUSTOMER': return '#15803D';
      default: return '#64748B';
    }
  }};

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    margin-right: 6px;
    background: currentColor;
  }
`;

const ActionButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1B5E20;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #C51111;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

export default CompanyManagement;