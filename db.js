function promessa(pedido) {
  return new Promise((resolve, reject) => {
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

function abrirBanco() {
  const pedido = indexedDB.open("agenda-db", 2);

  pedido.onupgradeneeded = (evento) => {
    const db = pedido.result;
    if (evento.oldVersion < 1) {
      db.createObjectStore("compromissos", { keyPath: "id" });
    }
    if (evento.oldVersion < 2) {
      db.createObjectStore("fila", {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  };

  return promessa(pedido);
}

function store(nome, modo) {
  return abrirBanco().then((db) =>
    db.transaction(nome, modo).objectStore(nome),
  );
}
function listar(nome) {
  return store(nome, "readonly").then((s) => promessa(s.getAll()));
}
function salvar(nome, objeto) {
  return store(nome, "readwrite").then((s) => promessa(s.put(objeto)));
}
function excluir(nome, id) {
  return store(nome, "readwrite").then((s) => promessa(s.delete(id)));
}
function limpar(nome) {
  return store(nome, "readwrite").then((s) => promessa(s.clear()));
}
