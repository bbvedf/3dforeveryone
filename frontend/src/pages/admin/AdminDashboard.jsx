import React, { useState, useEffect } from "react";
import api from "../../api/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    ventas: false,
    topProductos: false,
    estados: false,
    categorias: false,
    bajoStock: false,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, [period]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/dashboard/stats?period=${period}`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading && !stats) {
    return (
      <div className="dashboard-container">
        <div className="loading">Cargando dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-container">
        <div className="error">No se pudieron cargar las estadísticas</div>
      </div>
    );
  }

  // Colores para gráficos
  const COLORS = ["#3a86ff", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>📊 Dashboard Administrativo</h1>
        <div className="period-selector">
          <button
            className={`period-btn ${period === "today" ? "active" : ""}`}
            onClick={() => setPeriod("today")}
          >
            Hoy
          </button>
          <button
            className={`period-btn ${period === "week" ? "active" : ""}`}
            onClick={() => setPeriod("week")}
          >
            Semana
          </button>
          <button
            className={`period-btn ${period === "month" ? "active" : ""}`}
            onClick={() => setPeriod("month")}
          >
            Mes
          </button>
        </div>
      </div>

      {/* KPI Cards principales */}
      <div className="kpi-grid">
        <KPICard
          kpi={stats.ingresos_mes}
          icon="💰"
          expanded={false}
        />
        <KPICard
          kpi={stats.ingresos_hoy}
          icon="💵"
          expanded={false}
        />
        <KPICard
          kpi={stats.pedidos_confirmados}
          icon="✅"
          expanded={false}
        />
        <KPICard
          kpi={stats.pedidos_pendientes}
          icon="⏳"
          expanded={false}
        />
        <KPICard
          kpi={stats.clientes_nuevos_mes}
          icon="👥"
          expanded={false}
        />
        <KPICard
          kpi={stats.productos_bajo_stock}
          icon="🔴"
          expanded={false}
        />
      </div>

      {/* Secciones Expandibles */}
      <div className="expandable-sections">
        {/* Ventas últimos 30 días */}
        <ExpandableSection
          title="📈 Ventas (Últimos 30 días)"
          isExpanded={expandedSections.ventas}
          onToggle={() => toggleSection("ventas")}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.ventas_ultimos_30_dias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #3a86ff",
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3a86ff"
                strokeWidth={2}
                dot={{ fill: "#3a86ff" }}
                name="Ingresos ($)"
              />
              <Line
                type="monotone"
                dataKey="orders_count"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6" }}
                name="Pedidos"
              />
            </LineChart>
          </ResponsiveContainer>
        </ExpandableSection>

        {/* Top productos */}
        <ExpandableSection
          title="🏆 Top 5 Productos"
          isExpanded={expandedSections.topProductos}
          onToggle={() => toggleSection("topProductos")}
        >
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad Vendida</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_productos.map((producto, idx) => (
                  <tr key={idx}>
                    <td>{producto.nombre}</td>
                    <td className="text-center">{producto.cantidad_vendida}</td>
                    <td className="text-right text-success">
                      ${producto.ingresos.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ExpandableSection>

        {/* Pedidos por estado */}
        <ExpandableSection
          title="📦 Distribución por Estado"
          isExpanded={expandedSections.estados}
          onToggle={() => toggleSection("estados")}
        >
          <div className="chart-row">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie
                  data={stats.pedidos_por_estado}
                  dataKey="cantidad"
                  nameKey="estado"
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) =>
                    `${entry.estado}: ${entry.cantidad} (${entry.porcentaje}%)`
                  }
                >
                  {stats.pedidos_por_estado.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #3a86ff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="state-list">
              {stats.pedidos_por_estado.map((estado, idx) => (
                <div key={idx} className="state-item">
                  <div
                    className="state-color"
                    style={{
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  ></div>
                  <div className="state-info">
                    <div className="state-name">{estado.estado}</div>
                    <div className="state-count">
                      {estado.cantidad} pedidos ({estado.porcentaje}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ExpandableSection>

        {/* Categorías */}
        <ExpandableSection
          title="🏷️ Ingresos por Categoría"
          isExpanded={expandedSections.categorias}
          onToggle={() => toggleSection("categorias")}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.distribucion_por_categoria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="categoria" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #3a86ff",
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend />
              <Bar dataKey="ingresos" fill="#3a86ff" name="Ingresos ($)" />
              <Bar dataKey="cantidad" fill="#8b5cf6" name="Pedidos" />
            </BarChart>
          </ResponsiveContainer>
        </ExpandableSection>

        {/* Bajo stock */}
        <ExpandableSection
          title="🔴 Productos Bajo Stock"
          isExpanded={expandedSections.bajoStock}
          onToggle={() => toggleSection("bajoStock")}
        >
          {stats.productos_bajo_stock_detalle.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.productos_bajo_stock_detalle.map((prod, idx) => (
                    <tr key={idx} className={`stock-${prod.stock === 0 ? 'critical' : 'warning'}`}>
                      <td>{prod.nombre}</td>
                      <td className="text-center">
                        <span className="stock-badge">{prod.stock}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">✅ Todos los productos tienen buen stock</div>
          )}
        </ExpandableSection>
      </div>
    </div>
  );
};

// Componente KPI Card
const KPICard = ({ kpi, icon, expanded }) => {
  const getColorClass = () => {
    if (kpi.color === "green") return "color-green";
    if (kpi.color === "red") return "color-red";
    if (kpi.color === "blue") return "color-blue";
    if (kpi.color === "orange") return "color-orange";
    if (kpi.color === "purple") return "color-purple";
    return "color-gray";
  };

  return (
    <div className={`kpi-card ${getColorClass()}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <div className="kpi-label">{kpi.label}</div>
        <div className="kpi-value">
          {kpi.value.toLocaleString()}
          {kpi.unit && <span className="kpi-unit">{kpi.unit}</span>}
        </div>
        {kpi.variation !== null && kpi.variation !== undefined && (
          <div className={`kpi-variation ${kpi.variation >= 0 ? 'positive' : 'negative'}`}>
            {kpi.variation >= 0 ? '📈' : '📉'} {Math.abs(kpi.variation)}%
          </div>
        )}
      </div>
    </div>
  );
};

// Componente Sección Expandible
const ExpandableSection = ({
  title,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div className="expandable-section">
      <button className="section-header" onClick={onToggle}>
        <span className="section-title">{title}</span>
        <span className={`toggle-icon ${isExpanded ? 'open' : ''}`}>▼</span>
      </button>
      {isExpanded && <div className="section-content">{children}</div>}
    </div>
  );
};

export default AdminDashboard;
