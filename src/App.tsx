import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DirectoryPage } from './pages/DirectoryPage';
import { EntryDetailPage } from './pages/EntryDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DirectoryPage />} />
        <Route path="/entry/:id" element={<EntryDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
