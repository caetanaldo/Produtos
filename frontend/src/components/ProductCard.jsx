export default function ProductCard({ p, onAdd }) {
  return (
    <div>
      <h3>{p.name}</h3>
      <p>R$ {p.price}</p>
      <button onClick={onAdd}>Adicionar</button>
    </div>
  )
}