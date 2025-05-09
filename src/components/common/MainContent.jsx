import styled from 'styled-components';

const MainContent = styled.div`
  flex: 1;
  padding: 30px 80px;
  overflow-y: auto;
  width: 90%;
  box-sizing: border-box;

  @media (min-width: 1000px) {
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (max-width: 999px) {
    max-width: 100%;
    padding: 30px 40px;
  }

  @media (max-width: 800px) {
    padding: 30px 20px;
  }
`;

export default MainContent; 