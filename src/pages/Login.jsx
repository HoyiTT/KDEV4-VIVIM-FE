import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api'; // Import API_ENDPOINTS

const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const LeftPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #2E7D32 0%, #81C784 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 40px;
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
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const FeatureContent = styled.div`
  max-width: 500px;
  position: relative;
  z-index: 2;
  font-family: 'Nanum Gothic', sans-serif;
  
  h2 {
    font-size: 36px;
    margin-bottom: 16px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    animation: fadeInDown 1s ease-out;
    font-family: 'BMHANNAAir', 'Nanum Gothic', sans-serif;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  
  p {
    font-size: 18px;
    margin-bottom: 32px;
    opacity: 0.9;
    animation: fadeInUp 1s ease-out 0.3s both;
    line-height: 1.6;
  }
  
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
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
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  opacity: 0;
  animation: slideIn 0.5s ease-out forwards;
  animation-delay: ${props => props.index * 0.2 + 0.5}s;
  font-family: 'Nanum Gothic', sans-serif;
  letter-spacing: -0.3px;
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

const FeatureIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  margin-right: 12px;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 450px;
  padding: 48px;
  background-color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  animation: fadeIn 1s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const LogoImage = styled.img`
  width: 120px;
  height: 100px;
  margin: 0 auto 20px;
  object-fit: contain;
  animation: bounce 1s ease-out;
  
  @keyframes bounce {
    0% { transform: translateY(-20px); opacity: 0; }
    50% { transform: translateY(10px); opacity: 0.7; }
    100% { transform: translateY(0); opacity: 1; }
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin-top: -20px;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 8px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #4040ff;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(90deg, #2E7D32 0%, #81C784 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: all 0.5s;
  }
  
  &:hover:after {
    left: 100%;
  }
`;

const ForgotPassword = styled.a`
  display: block;
  margin-top: 16px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const Footer = styled.footer`
  margin-top: 40px;
  color: #999;
  font-size: 12px;
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
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  animation: scaleIn 0.3s ease-out;
  
  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
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
  margin-top: 10px;
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
  &:hover {
    background-color: #e0e0e0;
  }
`;

const DemoCredentials = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: left;
  border-left: 4px solid #2E7D32;
`;

const DemoTitle = styled.h3`
  font-size: 16px;
  color: #2E7D32;
  margin: 0 0 12px 0;
`;

const CredentialGroup = styled.div`
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  font-size: 14px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CredentialLabel = styled.span`
  font-weight: 600;
  margin-right: 8px;
  color: #333;
`;

const CredentialText = styled.span`
  color: #666;
  font-family: monospace;
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
`;

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

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('로그인 응답:', data);

        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('refreshToken', data.refresh_token);
          window.location.href = '/dashboard-admin';
        } else {
          alert('로그인에 실패했습니다. 다시 시도해주세요.');
        }
      } else {
        alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      alert('이메일을 입력해주세요.');
      return;
    }
    
    try {
      const response = await fetch(`${API_ENDPOINTS.RESET_PASSWORD}?email=${resetEmail}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('비밀번호가 1q2w3e4r로 초기화되었습니다.');
        setShowForgotPasswordModal(false);
        setResetEmail('');
      } else {
        alert('비밀번호 초기화에 실패했습니다. 이메일을 확인해주세요.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      alert('비밀번호 초기화 중 오류가 발생했습니다.');
    }
  };

  return (
    <LoginContainer>
      <LeftPanel>
        <FeatureContent>
          <h2>효율적인 프로젝트 관리</h2>
          <p>팀과 함께 프로젝트를 계획하고, 추적하고, 완료하세요.</p>
          <FeatureList>
            <FeatureItem index={0}>
              <FeatureIcon>✓</FeatureIcon>
              <span>직관적인 대시보드</span>
            </FeatureItem>
            <FeatureItem index={1}>
              <FeatureIcon>✓</FeatureIcon>
              <span>실시간 협업</span>
            </FeatureItem>
            <FeatureItem index={2}>
              <FeatureIcon>✓</FeatureIcon>
              <span>진행 상황 추적</span>
            </FeatureItem>
          </FeatureList>
        </FeatureContent>
      </LeftPanel>
      <LoginBox>
        <LogoImage src="logo.png" alt="logo" />
        
        <DemoCredentials>
          <DemoTitle>체험용 계정</DemoTitle>
          <CredentialGroup>
            <CredentialLabel>관리자:</CredentialLabel>
            <CredentialText>admin@naver.com / 1234</CredentialText>
          </CredentialGroup>
          <CredentialGroup>
            <CredentialLabel>개발사:</CredentialLabel>
            <CredentialText>developer@naver.com / 1234</CredentialText>
          </CredentialGroup>
        </DemoCredentials>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>이메일</Label>
            <Input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <Label>비밀번호</Label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputGroup>

          <LoginButton type="submit">로그인</LoginButton>
        </Form>

        <ForgotPassword onClick={() => setShowForgotPasswordModal(true)}>
          비밀번호를 잊으셨나요?
        </ForgotPassword>
        
        <Footer>
          © 2025 Kernel360 - Welcommu. All rights reserved.
        </Footer>
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
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </InputGroup>
              <ModalButtonGroup>
                <CancelButton type="button" onClick={() => setShowForgotPasswordModal(false)}>
                  취소
                </CancelButton>
                <SubmitButton type="submit">
                  비밀번호 재설정
                </SubmitButton>
              </ModalButtonGroup>
            </ModalForm>
          </ModalContent>
        </ModalOverlay>
      )}
    </LoginContainer>
  );
};

export default Login;