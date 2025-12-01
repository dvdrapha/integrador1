import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEpis: 0,
    episEmUso: 0,
    totalFuncionarios: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar EPIs cadastrados
        const episRes = await fetch('/api/epis');
        const episData = await episRes.json();
        
        // Total de unidades de EPIs (soma quantidade_total)
        const totalEpisUnidades = Array.isArray(episData)
          ? episData.reduce((sum, epi) => {
              const qtd = parseInt(epi.quantidade_total, 10);
              return sum + (Number.isNaN(qtd) ? 0 : qtd);
            }, 0)
          : 0;

        // Buscar EPIs em uso
        const episUsoRes = await fetch('/api/epis-uso');
        const episUsoData = await episUsoRes.json();
        const episEmUso = episUsoData.filter(item => !item.data_devolucao).length;
        
        // Buscar total de funcionários
        const funcRes = await fetch('/api/funcionarios');
        const funcData = await funcRes.json();

        setStats({
          totalEpis: totalEpisUnidades,
          episEmUso: episEmUso,
          totalFuncionarios: funcData.length
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Carregando estatísticas...</div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Visão geral do sistema de gestão de EPIs</p>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Total de EPIs</span>
            <span className={styles.cardIcon}>🦺</span>
          </div>
          <div className={styles.cardValue}>{stats.totalEpis}</div>
          <div className={styles.cardLabel}>EPIs cadastrados</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>EPIs em Uso</span>
            <span className={styles.cardIcon}>📋</span>
          </div>
          <div className={styles.cardValue}>{stats.episEmUso}</div>
          <div className={styles.cardLabel}>Atualmente emprestados</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Funcionários</span>
            <span className={styles.cardIcon}>👥</span>
          </div>
          <div className={styles.cardValue}>{stats.totalFuncionarios}</div>
          <div className={styles.cardLabel}>Cadastrados no sistema</div>
        </div>
      </div>
    </div>
  );
};
