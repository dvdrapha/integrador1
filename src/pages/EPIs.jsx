import { useState, useEffect } from 'react';
import styles from './EPIs.module.css';

export const EPIs = () => {
  const [loading, setLoading] = useState(false);
  const [epis, setEpis] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openModal, setOpenModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    validade: '',
    fabricante: '',
    ca: '',
    quantidade_total: ''
  });

  useEffect(() => {
    fetchEpis();
  }, []);

  const fetchEpis = async () => {
    try {
      const response = await fetch('/api/epis');
      const data = await response.json();
      setEpis(data);
    } catch (error) {
      console.error('Erro ao carregar EPIs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/epis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar EPI');
      }

      setMessage({ type: 'success', text: 'EPI cadastrado com sucesso!' });
      setFormData({
        nome: '',
        categoria: '',
        validade: '',
        fabricante: '',
        ca: '',
        quantidade_total: ''
      });
      fetchEpis();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, id: null });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.id) return;

    try {
      const response = await fetch(`/api/epis/${confirmDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Erro ao excluir EPI');
      }

      setMessage({ type: 'success', text: data?.message || 'EPI excluído com sucesso!' });
      fetchEpis();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      handleDeleteCancel();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Gerenciamento de EPIs</h1>
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className={styles.submitBtn}
          style={{ padding: '0.5rem 1.25rem' }}
        >
          Cadastrar novo EPI
        </button>
      </div>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`} style={{ marginBottom: '1rem' }}>
          {message.text}
        </div>
      )}

      {/* Modal de cadastro de EPI */}
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
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem' }}>Novo EPI</h2>
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
              <label className={styles.label}>Nome do EPI *</label>
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
              <label className={styles.label}>Categoria *</label>
              <select 
                name="categoria"
                className={styles.select}
                value={formData.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="Proteção Cabeça">Proteção Cabeça</option>
                <option value="Proteção Olhos">Proteção Olhos</option>
                <option value="Proteção Auditiva">Proteção Auditiva</option>
                <option value="Proteção Respiratória">Proteção Respiratória</option>
                <option value="Proteção Mãos">Proteção Mãos</option>
                <option value="Proteção Pés">Proteção Pés</option>
                <option value="Proteção Corpo">Proteção Corpo</option>
                <option value="Proteção Altura">Proteção Altura</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Validade</label>
              <input 
                type="date"
                name="validade"
                className={styles.input}
                value={formData.validade}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Fabricante</label>
              <input 
                type="text"
                name="fabricante"
                className={styles.input}
                value={formData.fabricante}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>CA (Certificado de Aprovação)</label>
              <input 
                type="text"
                name="ca"
                className={styles.input}
                value={formData.ca}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Quantidade Total *</label>
              <input 
                type="number"
                name="quantidade_total"
                className={styles.input}
                value={formData.quantidade_total}
                onChange={handleChange}
                min="0"
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
                {loading ? 'Cadastrando...' : 'Salvar EPI'}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>EPIs Cadastrados</h2>
        {epis.length === 0 ? (
          <div className={styles.loading}>Nenhum EPI cadastrado ainda</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>CA</th>
                  <th>Validade</th>
                  <th>Qtd. Total</th>
                  <th>Qtd. Disponível</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {epis.map((epi) => (
                  <tr key={epi.id}>
                    <td style={{ fontWeight: 600 }}>{epi.nome}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.primary}`}>
                        {epi.categoria}
                      </span>
                    </td>
                    <td>{epi.ca || '-'}</td>
                    <td>{epi.validade ? new Date(epi.validade).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>{epi.quantidade_total}</td>
                    <td>
                      <span className={`${styles.badge} ${epi.quantidade_disponivel > 0 ? styles.success : styles.warning}`}>
                        {epi.quantidade_disponivel}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(epi.id)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          background: 'var(--danger-red, #e11d48)',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDelete.open && (
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
              Excluir EPI
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', marginBottom: '1.25rem' }}>
              Deseja realmente excluir este EPI?
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
                onClick={handleDeleteCancel}
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
                onClick={handleDeleteConfirm}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: 'var(--danger-red, #e11d48)',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
