import { useState, useEffect } from 'react';
import styles from './EPIs.module.css';

export const Estoque = () => {
  const [epis, setEpis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEpis = async () => {
      try {
        const response = await fetch('/api/epis');
        const data = await response.json();
        setEpis(data);
      } catch (error) {
        console.error('Erro ao carregar estoque:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpis();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Carregando estoque...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>Controle de Estoque</h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
        Visualize a disponibilidade de EPIs em estoque
      </p>

      <div className={styles.section}>
        {epis.length === 0 ? (
          <div className={styles.loading}>Nenhum EPI em estoque</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Quantidade Total</th>
                  <th>Quantidade Disponível</th>
                  <th>Em Uso</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {epis.map((epi) => {
                  const emUso = epi.quantidade_total - epi.quantidade_disponivel;
                  const percentualDisponivel = (epi.quantidade_disponivel / epi.quantidade_total) * 100;
                  
                  let statusBadge = styles.success;
                  let statusText = 'Estoque bom';
                  
                  if (percentualDisponivel < 20) {
                    statusBadge = styles.error;
                    statusText = 'Estoque crítico';
                  } else if (percentualDisponivel < 40) {
                    statusBadge = styles.warning;
                    statusText = 'Estoque baixo';
                  }

                  return (
                    <tr key={epi.id}>
                      <td style={{ fontWeight: 600 }}>{epi.nome}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.primary}`}>
                          {epi.categoria}
                        </span>
                      </td>
                      <td>{epi.quantidade_total}</td>
                      <td>
                        <strong style={{ fontSize: '1rem', color: 'var(--primary-blue)' }}>
                          {epi.quantidade_disponivel}
                        </strong>
                      </td>
                      <td>{emUso}</td>
                      <td>
                        <span className={`${styles.badge} ${statusBadge}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
