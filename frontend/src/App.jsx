import { useEffect, useState } from "react"

function App() {
  const [produtos, setProdutos] = useState([])
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")

  // 🔥 buscar produtos
  const fetchProdutos = () => {
    fetch("http://localhost:5000/products")
      .then(res => res.json())
      .then(data => setProdutos(data))
  }

  useEffect(() => {
    fetchProdutos()
  }, [])

  // 🔥 cadastrar produto
  const handleSubmit = (e) => {
    e.preventDefault()

    fetch("http://localhost:5000/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        price: Number(price)
      })
    })
      .then(() => {
        setName("")
        setPrice("")
        fetchProdutos()
      })
  }

  return (
    <div style={styles.container}>
      <h1>🛍️ Produtos</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Nome do produto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="number"
          placeholder="Preço"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Adicionar
        </button>
      </form>

      {/* LISTA */}
      <div style={styles.grid}>
        {produtos.map(p => (
          <div key={p.id} style={styles.card}>
            <h2>{p.name}</h2>
            <p>R$ {p.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App

// 💅 estilos simples
const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial",
    textAlign: "center"
  },
  form: {
    marginBottom: "20px"
  },
  input: {
    padding: "10px",
    margin: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  button: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    background: "#333",
    color: "#fff",
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px"
  },
  card: {
    border: "1px solid #ccc",
    padding: "10px",
    borderRadius: "10px",
    background: "#f9f9f9"
  }
}