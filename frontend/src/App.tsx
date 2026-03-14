import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { GroupListPage } from './pages/GroupListPage'
import { GroupDetailPage } from './pages/GroupDetailPage'
import { GiftListPage } from './pages/GiftListPage'
import { GiftListDetailPage } from './pages/GiftListDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/groups"
            element={
              <PrivateRoute>
                <GroupListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <PrivateRoute>
                <GroupDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/gift-lists"
            element={
              <PrivateRoute>
                <GiftListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/gift-lists/:id"
            element={
              <PrivateRoute>
                <GiftListDetailPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/gift-lists" replace />} />
          <Route path="*" element={<Navigate to="/gift-lists" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
