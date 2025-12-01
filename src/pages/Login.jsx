import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

export const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    empresa: '', 
    nome: '', 
    email: '', 
    password: '' 
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(loginData.email, loginData.password);
    
    if (!result.success) {
      setError(result.error || 'Erro ao fazer login');
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(
      registerData.empresa,
      registerData.nome,
      registerData.email,
      registerData.password
    );
    
    if (!result.success) {
      setError(result.error || 'Erro ao criar conta');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>🛡️</div>
          <h1 className={styles.heroTitle}>
            Gestão de EPIs
          </h1>
          <p className={styles.heroDescription}>
            Sistema completo para gerenciar equipamentos de proteção individual, 
            controlar estoque e acompanhar EPIs em uso por seus funcionários.
          </p>
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {activeTab === 'login' ? 'Entrar' : 'Criar conta'}
            </h2>
            <p className={styles.formSubtitle}>
              {activeTab === 'login' 
                ? 'Acesse sua conta para gerenciar seus EPIs' 
                : 'Cadastre sua empresa e comece a usar'}
            </p>
          </div>

          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'login' ? styles.active : ''}`}
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
            >
              Entrar
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'register' ? styles.active : ''}`}
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
            >
              Criar conta
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {activeTab === 'login' ? (
            <form className={styles.form} onSubmit={handleLogin}>
              <div className={styles.formGroup}>
                <label className={styles.label}>E-mail</label>
                <input 
                  type="email"
                  className={styles.input}
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Senha</label>
                <input 
                  type="password"
                  className={styles.input}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleRegister}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nome da Empresa</label>
                <input 
                  type="text"
                  className={styles.input}
                  value={registerData.empresa}
                  onChange={(e) => setRegisterData({ ...registerData, empresa: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Seu Nome</label>
                <input 
                  type="text"
                  className={styles.input}
                  value={registerData.nome}
                  onChange={(e) => setRegisterData({ ...registerData, nome: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>E-mail</label>
                <input 
                  type="email"
                  className={styles.input}
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Senha</label>
                <input 
                  type="password"
                  className={styles.input}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
