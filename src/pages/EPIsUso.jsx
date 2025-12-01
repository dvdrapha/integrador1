import { useState, useEffect } from 'react';
import styles from './EPIs.module.css';

export const EPIsUso = () => {
  const [loading, setLoading] = useState(false);
  const [episUso, setEpisUso] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmData, setConfirmData] = useState({ open: false, id: null });
  const [openEntregaModal, setOpenEntregaModal] = useState(false);
  
  const [formData, setFormData] = useState({
    funcionario_id: '',
    epi_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [episUsoRes, funcRes, episRes] = await Promise.all([
        fetch('/api/epis-uso'),
        fetch('/api/funcionarios'),
        fetch('/api/epis')
      ]);

      const episUsoData = await episUsoRes.json();
      const funcData = await funcRes.json();
      const episData = await episRes.json();

      setEpisUso(episUsoData);
      setFuncionarios(funcData);
      setEpis(episData.filter(epi => epi.quantidade_disponivel > 0));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/epis-uso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funcionario_id: formData.funcionario_id,
          epi_id: formData.epi_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao registrar entrega de EPI');
      }

      setMessage({ type: 'success', text: 'EPI entregue com sucesso!' });
      setFormData({ funcionario_id: '', epi_id: '' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDevolver = (id) => {
    setConfirmData({ open: true, id });
  };

  const handleConfirmClose = () => {
    setConfirmData({ open: false, id: null });
  };

  const handleConfirmDevolver = async () => {
    if (!confirmData.id) return;

    try {
      const response = await fetch(`/api/epis-uso/${confirmData.id}/devolver`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erro ao registrar devolução');
      }

      setMessage({ type: 'success', text: 'Devolução registrada com sucesso!' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      handleConfirmClose();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>EPIs em Uso</h1>
        <button
          type="button"
          onClick={() => setOpenEntregaModal(true)}
          className={styles.submitBtn}
          style={{ padding: '0.5rem 1.25rem' }}
        >
          Registrar nova entrega
        </button>
      </div>
      
      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`} style={{ marginBottom: '1rem' }}>
          {message.text}
        </div>
      )}

      {/* Modal de nova entrega */}
      {openEntregaModal && (
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
              <h2 style={{ fontSize: '1.1rem' }}>Nova entrega de EPI</h2>
              <button
                type="button"
                onClick={() => setOpenEntregaModal(false)}
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
                setOpenEntregaModal(false);
              }
            }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Funcionário *</label>
                <select 
                  name="funcionario_id"
                  className={styles.select}
                  value={formData.funcionario_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione o funcionário...</option>
                  {funcionarios.map((func) => (
                    <option key={func.id} value={func.id}>
                      {func.nome} - {func.setor}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>EPI *</label>
                <select 
                  name="epi_id"
                  className={styles.select}
                  value={formData.epi_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione o EPI...</option>
                  {epis.map((epi) => (
                    <option key={epi.id} value={epi.id}>
                      {epi.nome} (Disponível: {epi.quantidade_disponivel})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setOpenEntregaModal(false)}
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
                  {loading ? 'Registrando...' : 'Registrar Entrega'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Histórico de Entregas</h2>
        {episUso.length === 0 ? (
          <div className={styles.loading}>Nenhuma entrega registrada ainda</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>EPI</th>
                  <th>Data Entrega</th>
                  <th>Data Devolução</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {episUso.map((item) => {
                  const isDevolvido = !!item.data_devolucao;
                  
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.funcionario_nome}</td>
                      <td>{item.epi_nome}</td>
                      <td>{new Date(item.data_entrega).toLocaleDateString('pt-BR')}</td>
                      <td>
                        {isDevolvido 
                          ? new Date(item.data_devolucao).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${isDevolvido ? styles.success : styles.warning}`}>
                          {isDevolvido ? 'Devolvido' : 'Em uso'}
                        </span>
                      </td>
                      <td>
                        {!isDevolvido && (
                          <button
                            onClick={() => handleDevolver(item.id)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: 'var(--primary-blue)',
                              color: 'white',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}
                          >
                            Devolver
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmData.open && (
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
              maxWidth: '400px',
              width: '100%',
            }}
          >
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Confirmar devolução
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', marginBottom: '1.25rem' }}>
              Confirma a devolução deste EPI?
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={handleConfirmClose}
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
                type="button"
                onClick={handleConfirmDevolver}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: 'var(--primary-blue)',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
