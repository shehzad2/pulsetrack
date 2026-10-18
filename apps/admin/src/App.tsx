import { useEffect, useMemo, useState } from "react";
import CreateProjectForm from "./features/projects/components/CreateProjectForm";
import AuthPage from "./features/auth/components/AuthPage";
import IntegrationModal from "./features/projects/components/IntegrationModal";
import { Code2 } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Eye,
  Globe,
  IndianRupee,
  ShoppingBag,
  LogOut,
  RefreshCw,
  Users,
  Zap,
} from "lucide-react";
import {
  getEventTrends,
  getPopularPages,
  getProjects,
  getSummary,
  logout,
  type Admin,
  type EventTrend,
  type PopularPage,
  type Project,
  type Summary,
} from "./api";
import EventActivityChart from "./features/analytics/components/EventActivityChart";
import "./App.css";

const emptySummary: Summary = {
  total_events: 0,
  page_views: 0,
  unique_visitors: 0,
  unique_sessions: 0,
  orders_created: 0,
  order_value: 0,
};

function dateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function initialFromDate() {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  return dateString(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value ?? 0);
}

function App() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("pulsetrack_token") ?? "",
  );
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const saved = sessionStorage.getItem("pulsetrack_admin");
    if (!saved) return null;
    try {
      return JSON.parse(saved) as Admin;
    } catch {
      return null;
    }
  });
  const [integrationProject, setIntegrationProject] =useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectKey, setProjectKey] = useState("");


  const [from, setFrom] = useState(initialFromDate);
  const [to, setTo] = useState(() => dateString(new Date()));

  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [pages, setPages] = useState<PopularPage[]>([]);
  const [trends, setTrends] = useState<EventTrend[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const selectedProject = projects.find(
    (project) => project.public_key === projectKey,
  );


const chartData = useMemo(() => {
  const grouped = new Map<string, number>();

  for (const trend of trends) {
    const date = trend.date.slice(0, 10);
    grouped.set(
      date,
      (grouped.get(date) ?? 0) + Number(trend.total || 0),
    );
  }

  const result: { date: string; events: number; label: string }[] = [];
  const cursor = new Date(`${from}T12:00:00`);
  const last = new Date(`${to}T12:00:00`);

  while (cursor <= last) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, "0");
    const day = String(cursor.getDate()).padStart(2, "0");
    const date = `${year}-${month}-${day}`;

    result.push({
      date,
      events: grouped.get(date) ?? 0,
      label: `${month}-${day}`,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}, [trends, from, to]);


  useEffect(() => {
    if (!token) {
      setProjects([]);
      setProjectKey("");
      return;
    }

    let cancelled = false;
    setLoadingProjects(true);
    setDashboardError("");

    getProjects(token)
      .then((result) => {
        if (cancelled) return;
        setProjects(result.projects);
        setProjectKey((current) => {
          if (result.projects.some((project) => project.public_key === current)) {
            return current;
          }
          return result.projects[0]?.public_key ?? "";
        });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setDashboardError(error.message);
        if (error.message.toLowerCase().includes("session")) {
          handleSessionExpired();
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProjects(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !projectKey) {
      setSummary(emptySummary);
      setPages([]);
      setTrends([]);
      return;
    }

    if (from > to) {
      setDashboardError("The start date must be before the end date.");
      return;
    }

    let cancelled = false;
    setLoadingAnalytics(true);
    setDashboardError("");

    Promise.all([
      getSummary(token, projectKey, from, to),
      getPopularPages(token, projectKey, from, to),
      getEventTrends(token, projectKey, from, to),
    ])
      .then(([summaryResult, pagesResult, trendsResult]) => {
        if (cancelled) return;
        setSummary(summaryResult);
        setPages(pagesResult.pages);
        setTrends(trendsResult.trends);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setDashboardError(error.message);
        if (error.message.toLowerCase().includes("session")) {
          handleSessionExpired();
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAnalytics(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, projectKey, from, to]);

  function handleSessionExpired() {
    sessionStorage.removeItem("pulsetrack_token");
    sessionStorage.removeItem("pulsetrack_admin");
    setToken("");
    setAdmin(null);
  }

  async function handleLogout() {
    const currentToken = token;
    handleSessionExpired();
    try {
      if (currentToken) await logout(currentToken);
    } catch {
      // The local session is cleared even if the API is unavailable.
    }
  }

  if (!token) {
    return (
      <AuthPage
        onSuccess={(newToken, newAdmin) => {
          sessionStorage.setItem("pulsetrack_token", newToken);
          sessionStorage.setItem(
            "pulsetrack_admin",
            JSON.stringify(newAdmin),
          );
          setToken(newToken);
          setAdmin(newAdmin);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-mark"><Activity size={23} /></span>
          <span>PulseTrack</span>
        </a>

        <div className="workspace-label">WORKSPACE</div>
        <a className="nav-item active" href="#overview">
          <BarChart3 size={18} /> Overview
        </a>
        <a className="nav-item" href="#popular-pages">
          <Globe size={18} /> Popular pages
        </a>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            Analytics workspace
            <span className="status-label">Ready</span>
          </div>
          <div className="profile">
            <div className="avatar">
              {(admin?.name || admin?.email || "A").slice(0, 1).toUpperCase()}
            </div>
            <div className="profile-info">
              <strong>{admin?.name || "Workspace admin"}</strong>
              <span>{admin?.email}</span>
            </div>
            <button className="icon-button" onClick={handleLogout} title="Sign out" aria-label="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Workspace <span>/</span> Overview</div>
            <h1>Analytics overview</h1>
            <p className="page-subtitle">Monitor your website performance and visitor activity.</p>
          </div>
          <div className="topbar-right">
            <span className="live-indicator"><span className="status-dot" /> Tracking workspace</span>
            <div className="avatar top-avatar">
              {(admin?.name || admin?.email || "A").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="toolbar">
          <div className="project-control">
            <label htmlFor="project"><Globe size={17} /> Website</label>
            <select
              id="project"
              value={projectKey}
              onChange={(event) => setProjectKey(event.target.value)}
              disabled={loadingProjects || projects.length === 0}
            >
              {projects.length === 0 && <option value="">No websites available</option>}
              {projects.map((project) => (
                <option key={project.id} value={project.public_key}>
                  {project.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="refresh-button"
              disabled={!selectedProject}
              onClick={() => {
                if (selectedProject) {
                  setIntegrationProject(selectedProject);
                }
              }}
            >
              <Code2 size={16} />
              Integration details
            </button>
          </div>

          <div className="date-controls">
            <label><CalendarDays size={17} /> Date range</label>
            <input aria-label="Start date" type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} />
            <span className="date-separator">to</span>
            <input aria-label="End date" type="date" value={to} min={from} max={dateString(new Date())} onChange={(event) => setTo(event.target.value)} />
            <button className="refresh-button" onClick={() => { setFrom(initialFromDate()); setTo(dateString(new Date())); }} title="Last 7 days">
              <RefreshCw size={16} /> <span>Last 7 days</span>
            </button>
          </div>
        </section>
          <CreateProjectForm
          token={token}
          onCreated={(project) => {
            setProjects((current) =>
              [...current.filter((item) => item.id !== project.id), project].sort(
                (a, b) => a.name.localeCompare(b.name),
              ),
            );

            setProjectKey(project.public_key);
          }}
        />
        {dashboardError && <div className="error-banner dashboard-error">{dashboardError}</div>}

        {!loadingProjects && projects.length === 0 ? (
          <section className="empty-state">
            <div className="empty-icon"><Globe size={25} /></div>
            <h2>No websites connected yet</h2>
            <p>This admin account does not have any analytics projects assigned to it.</p>
          </section>
        ) : (
          <>
            <div className="section-heading">
              <div>
                <span className="eyebrow">PERFORMANCE SNAPSHOT</span>
                <h2>{selectedProject?.name ?? "Your website"}</h2>
              </div>
              <span className="updated-label">
                {loadingAnalytics ? "Updating data…" : "Date-filtered analytics"}
              </span>
            </div>

            <section className="metrics-grid">
              <MetricCard title="Page views" value={summary.page_views} icon={<Eye size={19} />} accent="blue" loading={loadingAnalytics} />
              <MetricCard title="Unique visitors" value={summary.unique_visitors} icon={<Users size={19} />} accent="violet" loading={loadingAnalytics} />
              <MetricCard title="Sessions" value={summary.unique_sessions} icon={<Activity size={19} />} accent="green" loading={loadingAnalytics} />
              <MetricCard title="Total events" value={summary.total_events} icon={<Zap size={19} />} accent="orange" loading={loadingAnalytics} />
              <MetricCard title="Orders created" value={summary.orders_created} icon={<ShoppingBag size={19} />} accent="green" loading={loadingAnalytics} />
              <MetricCard
                title="Order value"
                value={summary.order_value}
                icon={<IndianRupee size={19} />}
                accent="blue"
                loading={loadingAnalytics}
                formatValue={(value) => new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 2,
                }).format(value)}
              />
            </section>

            <section className="content-grid">
              <EventActivityChart data={chartData} />

              <article className="panel pages-panel" id="popular-pages">
                <div className="panel-heading">
                  <div>
                    <h3>Popular pages</h3>
                    <p>Pages with the most views</p>
                  </div>
                  <span className="panel-icon"><Globe size={18} /></span>
                </div>

                {pages.length === 0 ? (
                  <div className="pages-empty">
                    <Globe size={25} />
                    <strong>No page views yet</strong>
                    <span>Page activity will appear once tracking events arrive.</span>
                  </div>
                ) : (
                  <div className="pages-list">
                    {pages.slice(0, 8).map((page, index) => {
                      const maxViews = Math.max(...pages.map((item) => item.views), 1);
                      const percentage = Math.max(4, (page.views / maxViews) * 100);
                      return (
                        <div className="page-row" key={`${page.path}-${index}`}>
                          <div className="page-row-top">
                            <div className="page-name">
                              <span className="page-rank">{String(index + 1).padStart(2, "0")}</span>
                              <span title={page.path ?? "/"}>{page.path || "/"}</span>
                            </div>
                            <strong>{formatNumber(page.views)}</strong>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="panel-footer">
                  <span>Top pages in selected period</span>
                  <ArrowUpRight size={15} />
                </div>
              </article>
            </section>

            <footer className="dashboard-footer">
              <span>PulseTrack Analytics</span>
              <span>Insights for your digital experience</span>
            </footer>
          </>
        )}
      </main>
      {integrationProject && (
        <IntegrationModal
          project={integrationProject}
          onClose={() => setIntegrationProject(null)}
        />
      )}
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: "blue" | "violet" | "green" | "orange";
  loading: boolean;
  formatValue?: (value: number) => string;
};

function MetricCard({ title, value, icon, accent, loading, formatValue }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className={`metric-icon ${accent}`}>{icon}</span>
        <span className="metric-period">Selected period</span>
      </div>
      <div className="metric-value">{loading ? "—" : (formatValue ? formatValue(value) : formatNumber(value))}</div>
      <div className="metric-bottom">
        <span>{title}</span>
        <span className="metric-detail"> <ArrowUpRight size={14} /> Overview</span>
      </div>
    </article>
  );
}

export default App;
