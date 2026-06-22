import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api, { setAccessToken } from '../api/axios';
import { Loader } from '../components/Spinner.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUserState] = useState(null);
  const [isReady, setIsReady]   = useState(false);
  const refreshTimer = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    tryRefresh();
    return () => {
      isMountedRef.current = false;
      clearTimeout(refreshTimer.current);
    };
  }, []);

  async function tryRefresh() {
    try {
      const res = await api.post('/auth/refresh');
      if (!isMountedRef.current) return;
      setAccessToken(res.data.token);
      setUserState(res.data.user);
      scheduleRefresh();
    } catch {
      if (!isMountedRef.current) return;
      setAccessToken(null);
      setUserState(null);
    } finally {
      if (isMountedRef.current) {
        setIsReady(true);
      }
    }
  }

  function scheduleRefresh() {
    clearTimeout(refreshTimer.current);
    // access token живёт 15 минут — обновляем через 14
    refreshTimer.current = setTimeout(() => {
      tryRefresh();
    }, 14 * 60 * 1000);
  }

  function setUser(userData, accessToken) {
    setUserState(userData);
    setAccessToken(accessToken);
    scheduleRefresh();
  }

  async function logout() {
    try { await api.post('/auth/logout'); } catch { /* игнорируем */ }
    clearTimeout(refreshTimer.current);
    setAccessToken(null);
    setUserState(null);
  }

  // Пока идёт проверка токена — не рендерим приложение
  if (!isReady) {
    return (
      <main className="page">
        <Loader title="Проверяем сессию" description="Секунду, восстанавливаем ваш профиль." />
      </main>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}