import AdminInquiryList from './pages/AdminInquiryList';

// ... 기존 import 구문들 ...

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... 기존 라우트들 ... */}
        <Route path="/admin-inquiry" element={<AdminInquiryList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 