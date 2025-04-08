import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api'; // Import API_ENDPOINTS

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

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
        localStorage.setItem('token', data.access_token);
        navigate('/dashboard');
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
      <LoginBox>
        <LogoImage src="/logo.svg" alt="logo" />
        <Title>로그인</Title>
        
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
          © 2024 Company. All rights reserved.
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
                  재설정 링크 받기
                </SubmitButton>
              </ModalButtonGroup>
            </ModalForm>
          </ModalContent>
        </ModalOverlay>
      )}
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const LogoImage = styled.img`
  width: 60px;
  height: 60px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 32px;
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
  padding: 12px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 16px;
  &:hover {
    background-color: #333;
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
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

const SubmitButton = styled.button`
  flex: 1;
  padding: 12px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background-color: #333;
  }
`;

export default Login;