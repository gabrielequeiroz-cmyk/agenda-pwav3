const API = "http://localhost:3000/compromissos";

function verificar(resposta) {
  if (!resposta.ok) throw new Error(resposta.status);
  return resposta;
}

function enviar(op) {
  if (op.tipo === "criar") {
    return fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(op.dados),
    }).then(verificar);
  }
  if (op.tipo === "excluir") {
    return fetch(`${API}/${op.alvo}`, { method: "DELETE" }).then(verificar);
  }
}

function substituirLocal(lista) {
  return limpar("compromissos").then(() =>
    Promise.all(lista.map((c) => salvar("compromissos", c))),
  );
}

function atualizarDoServidor() {
  return fetch(API)
    .then(verificar)
    .then((resposta) => resposta.json())
    .then(substituirLocal)
    .then(mostrar)
    .catch(() => console.log("Sem servidor: usando dados locais"));
}

function sincronizar() {
  return listar("fila")
    .then((ops) => {
      if (ops.length === 0) return atualizarDoServidor();
      const op = ops[0];
      return enviar(op)
        .then(() => excluir("fila", op.id))
        .then(sincronizar);
    })
    .catch(() => console.log("Sincronização adiada"));
}
