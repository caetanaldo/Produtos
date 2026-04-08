import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// ================= API =================
const api = axios.create({
  baseURL: "http://localhost:3000",
});

// ================= CONTEXT =================
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  async function login(email, password) {
    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.token;

      localStorage.setItem("token", token);
      setToken(token);

      // decodifica payload do JWT
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);

      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Erro no login");
      return false;
    }
  }

  async function register(email, password, role = "user") {
    try {
      await api.post("/auth/register", { email, password, role });
      return true;
    } catch (err) {
      alert(err.response?.data?.error || "Erro no cadastro");
      return false;
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// ================= LOGIN =================
function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Preencha todos os campos");
      return;
    }

    const success = await login(form.email, form.password);

    if (success) {
      navigate("/cadastro");
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1>Login</h1>

        <input
          style={styles.input}
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Senha"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button style={styles.button}>Entrar</button>
      </form>
    </div>
  );
}

// ================= CADASTRO =================
function Cadastro() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { register, user } = useAuth();
  const navigate = useNavigate();

  async function handleRegister() {
    if (!form.email || !form.password) {
      alert("Preencha todos os campos");
      return;
    }

    const success = await register(form.email, form.password);

    if (success) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/produtos");
      }
    }
  }

  return (
    <div style={styles.container2}>
      <div style={styles.card}>
        <h1>Cadastro</h1>

        <input
          style={styles.input}
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Senha"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button style={styles.button} onClick={handleRegister}>
          Cadastrar
        </button>

        <button style={styles.adminBtn} onClick={() => navigate("/admin")}>
          Entrar como admin
        </button>
      </div>
    </div>
  );
}

// ================= PRODUTOS =================
function Produtos() {
  const { token, logout } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  async function carregarProdutos() {
    try {
      const res = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProdutos(res.data.data);
    } catch (err) {
      alert("Erro ao carregar produtos");
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  return (
    <div style={styles.page}>
      <h1>Produtos</h1>

      <div style={styles.grid}>
        {produtos.map((p) => (
          <div key={p.id} style={styles.productCard}>
            <h3>{p.name}</h3>
            <p>R$ {p.price}</p>
          </div>
        ))}
      </div>

      <button
        style={styles.logout}
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        Sair
      </button>
    </div>
  );
}

// ================= ADMIN =================
function Admin() {
  const { token, logout } = useAuth();
  const [form, setForm] = useState({ name: "", price: "" });
  const navigate = useNavigate();

  async function criarProduto() {
    try {
      await api.post(
        "/products",
        {
          name: form.name,
          price: Number(form.price),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Produto criado");
    } catch (err) {
      alert("Erro ao criar produto");
    }
  }

  return (
    <div style={styles.page}>
      <h1>Painel Admin</h1>

      <input
        style={styles.input}
        placeholder="Nome do produto"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        style={styles.input}
        placeholder="Preço"
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />

      <button style={styles.button} onClick={criarProduto}>
        Criar produto
      </button>

      <button
        style={styles.logout}
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        Sair
      </button>
    </div>
  );
}

// ================= PROTEÇÃO =================
function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
}

// ================= APP =================
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/cadastro"
            element={
              <PrivateRoute>
                <Cadastro />
              </PrivateRoute>
            }
          />

          <Route
            path="/produtos"
            element={
              <PrivateRoute>
                <Produtos />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// ================= ESTILO =================
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#1e293b",
  },
  container2: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f1f5f9",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    width: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  adminBtn: {
    padding: "10px",
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  page: {
    padding: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  productCard: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
  logout: {
    marginTop: "20px",
    padding: "10px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};