import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ user }) => {
  const navigate = useNavigate();

  if (!user) return null;

  const handleClick = () => {
    navigate(`/user-edit/${user.id}`);
  };

  return (
    <UserInfoSection onClick={handleClick}>
      <Card>
        <Header>
          <Avatar>{user.name[0]}</Avatar>
          <UserInfo>
            <Name>{user.name}</Name>
            <Company>{user.companyName}</Company>
          </UserInfo>
        </Header>
        <Details>
          <Detail>
            <Label>이메일</Label>
            <Value>{user.email}</Value>
          </Detail>
          <Detail>
            <Label>연락처</Label>
            <Value>{user.phone}</Value>
          </Detail>
          <Detail>
            <Label>직책</Label>
            <Value>{user.companyRole === 'ADMIN' ? '관리자' : '사용자'}</Value>
          </Detail>
        </Details>
      </Card>
    </UserInfoSection>
  );
};

const UserInfoSection = styled.div`
  margin-bottom: 24px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #3B82F6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Name = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const Company = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const Details = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const Detail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const Value = styled.span`
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
`;

export default UserProfile; 