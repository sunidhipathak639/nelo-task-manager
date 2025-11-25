import { Navigate } from 'react-router-dom'
import { getSession } from '../../utils/sessionStorage'

const ProtectedRoute = ({ children }) => {
  const token = getSession()
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default ProtectedRoute

