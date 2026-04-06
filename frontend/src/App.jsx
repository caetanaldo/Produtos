import { useState } from "react"

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    const url = isLogin
      ? "http://localhost:5000/auth/login"
      : "http://localhost:5000/auth/register"

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data)

        if (isLogin) {
          if (data.token) {
            setMsg("✅ Login feito com sucesso")
            localStorage.setItem("token", data.token)
          } else {
            setMsg("❌ Erro no login")
          }
        } else {
          setMsg("✅ Usuário cadastrado")
          setIsLogin(true)
        }
      })
      .catch(() => setMsg("❌ Erro ao conectar"))
  }

  return (
    <div style={styles.container}>
      <h1>{isLogin ? "🔐 Login" : "📝 Cadastro"}</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          {isLogin ? "Entrar" : "Cadastrar"}
        </button>
      </form>

      <p>{msg}</p>

      <button
        onClick={() => {
          setIsLogin(!isLogin)
          setMsg("")
        }}
        style={styles.switch}
      >
        {isLogin
          ? "Não tem conta? Cadastrar"
          : "Já tem conta? Fazer login"}
      </button>
    </div>
  )
}

export default App

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "250px"
  },
  input: {
    padding: "10px",
    margin: "5px 0",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#333",
    color: "#fff",
    cursor: "pointer"
  },
  switch: {
    marginTop: "10px",
    background: "none",
    border: "none",
    color: "blue",
    cursor: "pointer"
  }
}