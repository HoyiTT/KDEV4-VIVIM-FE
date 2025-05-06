import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axiosInstance';

const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
`;
const LeftPanel = styled.div`
  flex: 1.5;
  background: linear-gradient(135deg, #2E7D32 0%, #81C784 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 60px;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: -10%;
    left: -10%;
    width: 120%;
    height: 120%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    animation: pulse 15s infinite ease-in-out;
  }
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.5); opacity: 0.8; }
    100% { transform: scale(1); opacity: 0.5; }
  }
  @media (max-width: 768px) { display: none; }
`;

// 왼쪽 콘텐츠
const FeatureContent = styled.div`
  max-width: 500px;
  position: relative;
  z-index: 2;
  font-family: 'Nanum Gothic', sans-serif;
  h2 {
    font-size: 36px;
    margin-bottom: 50px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    animation: fadeInDown 1s ease-out;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;
const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  font-size: 16px;
  opacity: 0;
  animation: slideIn 0.5s ease-out forwards;
  animation-delay: ${props => props.$index * 0.2 + 0.5}s;
  font-family: 'Nanum Gothic', sans-serif;
  line-height: 1.6;
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  span {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 600;
    margin-right: 8px;
    font-size: 14px;
    background-color: rgba(255,255,255,0.2);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  div { flex: 1; }
`;

// 로그인 박스
const LoginBox = styled.div`
  flex: 0.8;
  max-width: 400px;
  width: 100%;
  padding: 60px;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: -4px 0 24px rgba(0,0,0,0.05);
  margin: 0 auto;
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;
const LogoImage = styled.img`
  width: 140px;
  height: 120px;
  margin: 0 auto 40px;
  object-fit: contain;
  animation: bounce 1s ease-out;
  @keyframes bounce {
    0% { transform: translateY(-20px); opacity: 0; }
    50% { transform: translateY(10px); opacity: 0.7; }
    100% { transform: translateY(0); opacity: 1; }
  }
`;

// 데모 계정
const DemoCredentials = styled.div`
  margin-bottom: 32px;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
`;
const DemoTitle = styled.h3`
  font-size: 16px;
  color: #2E7D32;
  margin-bottom: 16px;
  font-weight: 600;
`;
const CredentialGroup = styled.div`
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  font-size: 14px;
  &:last-child { margin-bottom: 0; }
`;
const CredentialLabel = styled.span`
  width: 60px;
  text-align: right;
  font-weight: 600;
  color: #334155;
  margin-right: 8px;
`;
const CredentialText = styled.span`
  color: #475569;
  font-family: 'SF Mono', 'Consolas', monospace;
  background-color: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
`;
const CredentialPassword = styled.span`
  color: #2E7D32;
  font-weight: 500;
  padding-left: 8px;
  border-left: 1px solid #e2e8f0;
`;

// 폼
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
const InputGroup = styled.div`
  text-align: left;
`;
const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
`;
const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #2E7D32;
    box-shadow: 0 0 0 2px rgba(46,125,50,0.1);
  }
  &::placeholder { color: #94a3b8; }
`;

// 버튼 & 링크
const SubmitButton = styled.button`
  flex: 1;
  padding: 12px;
  background: linear-gradient(90deg, #2E7D32 0%, #81C784 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;
const ForgotPassword = styled.a`
  display: block;
  margin-top: 16px;
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  &:hover { color: #2E7D32; text-decoration: underline; }
`;
const Footer = styled.footer`
  margin-top: 40px;
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
`;

// 모달
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;
const ModalTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
`;
const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const ModalButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;
const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  background-color: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  &:hover { background-color: #e0e0e0; }
`;

// 컴포넌트
const Login = () => {
  const navigate = useNavigate();
  const { logout, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      logout();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      alert('이메일을 입력해주세요.');
      return;
    }
    try {
      await axiosInstance.put(`${API_ENDPOINTS.RESET_PASSWORD}?email=${resetEmail}`);
      alert('비밀번호가 1q2w3e4r로 초기화되었습니다.');
      setShowForgotPasswordModal(false);
      setResetEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      alert('비밀번호 초기화에 실패했습니다.');
    }
  };

  return (
    <LoginContainer>
      <LeftPanel>
        <FeatureContent>
          <h2>비빔, 다채로운 소통의 한 그릇</h2>
          <FeatureList>
            <FeatureItem $index={0}>
              <div><span>개발사</span>팀과 함께 프로젝트를 계획하고, 추적하고, 완료하세요.</div>
            </FeatureItem>
            <FeatureItem $index={1}>
              <div><span>고객사</span>계약된 의뢰를 확인하고, 승인하고, 수정요청하세요.</div>
            </FeatureItem>
            <FeatureItem $index={2}>
              <div><span>관리자</span>프로젝트 진행 상황을 확인하고, 관리하세요.</div>
            </FeatureItem>
          </FeatureList>
        </FeatureContent>
      </LeftPanel>

      <LoginBox>
        <LogoImage src="logo.png" alt="logo" />
        <DemoCredentials>
          <DemoTitle>체험용 계정</DemoTitle>
          <CredentialGroup>
            <CredentialLabel>관리자 :</CredentialLabel>
            <CredentialText>
              admin@naver.com<CredentialPassword>1234</CredentialPassword>
            </CredentialText>
          </CredentialGroup>
          <CredentialGroup>
            <CredentialLabel>개발사 :</CredentialLabel>
            <CredentialText>
              developer@naver.com<CredentialPassword>1234</CredentialPassword>
            </CredentialText>
          </CredentialGroup>
          <CredentialGroup>
            <CredentialLabel>고객사 :</CredentialLabel>
            <CredentialText>
              customer@naver.com<CredentialPassword>1234</CredentialPassword>
            </CredentialText>
          </CredentialGroup>
        </DemoCredentials>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>이메일</Label>
            <Input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <Label>비밀번호</Label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </SubmitButton>
        </Form>

        <ForgotPassword onClick={() => setShowForgotPasswordModal(true)}>
          비밀번호를 잊으셨나요?
        </ForgotPassword>
        <Footer>© 2025 Kernel360 - Welcommu. All rights reserved.</Footer>
      </LoginBox>

      {showForgotPasswordModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>비밀번호 재설정</ModalTitle>
            <ModalForm onSubmit={handleForgotPassword}>
              <InputGroup>
                <Label>이메일</Label>
                <Input
                  type="email"
                  placeholder="가입한 이메일 주소를 입력하세요"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                />
              </InputGroup>
              <ModalButtonGroup>
                <CancelButton type="button" onClick={() => setShowForgotPasswordModal(false)}>
                  취소
                </CancelButton>
                <SubmitButton type="submit">비밀번호 재설정</SubmitButton>
              </ModalButtonGroup>
            </ModalForm>
          </ModalContent>
        </ModalOverlay>
      )}
    </LoginContainer>
  );
};

export default Login;
