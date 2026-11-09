function mostrar() {
  const main = document.querySelector("#conteudo");
  return Promise.all([listar("compromissos"), listar("fila")]).then(
    ([lista, fila]) => {
      const pendentes = fila
        .filter((op) => op.tipo === "criar")
        .map((op) => ({ ...op.dados, pendente: true }));
      main.innerHTML = lista
        .concat(pendentes)
        .sort((a, b) => a.hora.localeCompare(b.hora))
        .map((c) =>
          c.pendente
            ? `<p class="pendente">${c.hora} — ${c.titulo} (aguardando envio)</p>`
            : `<p>${c.hora} — ${c.titulo}
               <button onclick="remover(${c.id})">Excluir</button></p>`,
        )
        .join("");
    },
  );
}

function criar(compromisso) {
  return salvar("fila", { tipo: "criar", dados: compromisso })
    .then(mostrar)
    .then(sincronizar);
}

function remover(id) {
  return excluir("compromissos", id)
    .then(() => salvar("fila", { tipo: "excluir", alvo: id }))
    .then(mostrar)
    .then(sincronizar);
}

const form = document.querySelector("#form-compromisso");

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  criar({ hora: form.hora.value, titulo: form.titulo.value });
  form.reset();
});

window.addEventListener("online", sincronizar);

// Registro do Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    .then((registro) => {
      console.log("Service Worker registrado com sucesso:", registro);
    })
    .catch((erro) => {
      console.error("Erro ao registrar Service Worker:", erro);
    });
}

// Status da conexão
function atualizarStatus() {
  const status = document.querySelector("#status");

  if (navigator.onLine) {
    status.textContent = "Online";
    status.className = "online";
  } else {
    status.textContent = "Offline";
    status.className = "offline";
  }
}

window.addEventListener("online", atualizarStatus);
window.addEventListener("offline", atualizarStatus);

atualizarStatus();

mostrar();
sincronizar();
