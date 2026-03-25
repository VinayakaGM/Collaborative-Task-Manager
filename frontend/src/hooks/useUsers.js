import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const useUsers = () => {
  const { isManager } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isManager) return;
    setLoading(true);
    api.get('/users/assignable')
      .then((res) => setUsers(res.data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isManager]);

  return { users, loading };
};
