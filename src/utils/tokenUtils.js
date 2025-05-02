import { jwtDecode } from 'jwt-decode';

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

export const getDecodedToken = () => {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
};

export const isTokenValid = () => {
  const decodedToken = getDecodedToken();
  if (!decodedToken) return false;
  
  const currentTime = Date.now() / 1000;
  return decodedToken.exp > currentTime;
};

export const getUserId = () => {
  const decodedToken = getDecodedToken();
  return decodedToken?.userId;
};

export const getUserRole = () => {
  const decodedToken = getDecodedToken();
  return decodedToken?.role;
};

export const isAdmin = () => {
  return getUserRole() === 'ADMIN';
};

export const isClient = () => {
  return getUserRole() === 'CUSTOMER';
};

export const getTokenFromCookie = () => {
  try {
    const cookies = document.cookie.split('; ');
    console.log('현재 쿠키:', cookies);
    console.log('전체 쿠키 문자열:', document.cookie);
    
    const tokenCookie = cookies.find(row => row.startsWith('accessToken='));
    if (!tokenCookie) {
      console.log('쿠키에서 accessToken을 찾을 수 없습니다.');
      return null;
    }

    const token = tokenCookie.split('=')[1];
    if (!token) {
      console.log('accessToken 값이 비어있습니다.');
      return null;
    }

    // Bearer prefix 제거
    const pureToken = token.replace(/^Bearer\s/, '');
    console.log('쿠키에서 추출한 토큰:', pureToken);
    return pureToken;
  } catch (error) {
    console.error('토큰 추출 중 오류:', error);
    return null;
  }
};

export const decodeJwt = (token) => {
  try {
    if (!token) {
      console.log('디코딩할 토큰이 없습니다.');
      return null;
    }

    // Bearer prefix 제거
    const pureToken = token.replace(/^Bearer\s/, '');
    const decoded = jwtDecode(pureToken);
    console.log('디코딩된 토큰:', decoded);

    if (!decoded.role) {
      console.error('토큰에 role 클레임이 없습니다:', decoded);
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('JWT 디코딩 에러:', error);
    return null;
  }
};

export const validateToken = (token) => {
  try {
    if (!token) {
      console.log('검증할 토큰이 없습니다.');
      return false;
    }

    const decoded = decodeJwt(token);
    if (!decoded) {
      console.log('토큰 디코딩 실패');
      return false;
    }

    // role 클레임 확인
    if (!decoded.role) {
      console.error('토큰에 role 클레임이 없습니다');
      return false;
    }

    // 만료 시간 확인
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.error('토큰이 만료되었습니다');
      return false;
    }

    return true;
  } catch (error) {
    console.error('토큰 검증 중 오류:', error);
    return false;
  }
}; 