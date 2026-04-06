import { useState } from "react"

function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")

  const handleLogin = (e) => {
    e.preventDefault()

    fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data)

        if (data.token) {
          setMsg("✅ Login feito com sucesso")

          // salvar token
          localStorage.setItem("token", data.token)
        } else {
          setMsg("❌ Erro no login")
        }
      })
      .catch(() => setMsg("❌ Erro ao conectar"))
  }

  return (
    <div style={styles.container}>
      <h1>🔐 Login</h1>

      <form onSubmit={handleLogin} style={styles.form}>
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
          Entrar
        </button>
      </form>

      <p>{msg}</p>
    </div>
  )
}

export default App

// 💅 estilo simples
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
  }
}