import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext';

export default function GoogleAuthButton({ redirectTo = '/profile' }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { showToast } = useToast();

  async function handleSuccess(credentialResponse) {
    try {
      const res = await api.post('/auth/google', {
        idToken: credentialResponse.credential
      });

      setUser(res.data.user, res.data.token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      showToast({
        tone: 'danger',
        title: 'Ошибка входа через Google',
        description: err.response?.data?.message || 'Не удалось войти через Google'
      });
    }
  }

  function handleError() {
    showToast({
      tone: 'danger',
      title: 'Ошибка',
      description: 'Не удалось выполнить вход через Google'
    });
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text="continue_with"
        shape="rectangular"
        width="320"
      />
    </div>
  );
}