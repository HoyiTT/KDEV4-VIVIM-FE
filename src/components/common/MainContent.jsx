import styled from 'styled-components';

const MainContent = styled.div`
  flex: 1;
  padding: 30px 80px;
  overflow-y: auto;
  max-width: 1400px;
  margin: 0 auto;
  width: 90%;
  box-sizing: border-box;

@media (max-width: 1200px) {
    max-width: 1100px;
    padding: 30px 40px;
  }

  @media (max-width: 800px) {
    max-width: 500px;
    padding: 30px 20px;
  }
`;

export default MainContent; 