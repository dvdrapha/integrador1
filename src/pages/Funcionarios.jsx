import { useState, useEffect } from 'react';
import styles from './EPIs.module.css';

export const Funcionarios = () => {
  const [loading, setLoading] = useState(false);
  const [funcionarios, setFuncionarios] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openModal, setOpenModal] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    setor: ''
  });

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    try {
      const response = await fetch('/api/funcionarios');
      const data = await response.json();
      setFuncionarios(data);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/funcionarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Já existe um funcionário cadastrado com este CPF');
        }
        throw new Error('Erro ao cadastrar funcionário');
      }

      setMessage({ type: 'success', text: 'Funcionário cadastrado com sucesso!' });
      setFormData({ nome: '', cpf: '', setor: '' });
      fetchFuncionarios();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      // Remove caracteres não numéricos e limita a 11 dígitos
      const numbers = value.replace(/\D/g, '').slice(0, 11);
      setFormData({ ...formData, [name]: numbers });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Gerenciamento de Funcionários</h1>
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className={styles.submitBtn}
          style={{ padding: '0.5rem 1.25rem' }}
        >
          Cadastrar novo funcionário
        </button>
      </div>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`} style={{ marginBottom: '1rem' }}>
          {message.text}
        </div>
      )}

      {openModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.25)',
              maxWidth: '520px',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem' }}>Novo Funcionário</h2>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <form className={styles.form} onSubmit={async (e) => {
              await handleSubmit(e);
              if (!message.type || message.type === 'success') {
                setOpenModal(false);
              }
            }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nome Completo *</label>
                <input 
                  type="text"
                  name="nome"
                  className={styles.input}
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>CPF *</label>
                <input 
                  type="text"
                  name="cpf"
                  className={styles.input}
                  value={formatCPF(formData.cpf)}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Setor *</label>
                <input 
                  type="text"
                  name="setor"
                  className={styles.input}
                  value={formData.setor}
                  onChange={handleChange}
                  placeholder="Ex: Produção, Manutenção, Logística..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '999px',
                    border: '1px solid var(--gray-300)',
                    background: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? 'Cadastrando...' : 'Salvar Funcionário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Funcionários Cadastrados</h2>
        {funcionarios.length === 0 ? (
          <div className={styles.loading}>Nenhum funcionário cadastrado ainda</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Setor</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((func) => (
                  <tr key={func.id}>
                    <td style={{ fontWeight: 600 }}>{func.nome}</td>
                    <td>{formatCPF(func.cpf)}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.primary}`}>
                        {func.setor}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

