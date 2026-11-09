let materiais = JSON.parse(localStorage.getItem("materiais")) || [];
let historico = JSON.parse(localStorage.getItem("historico")) || [];

function salvarDados() {
    localStorage.setItem("materiais", JSON.stringify(materiais));
    localStorage.setItem("historico", JSON.stringify(historico));
}

function mostrarTela(nome) {
    document.querySelectorAll(".tela").forEach(tela => {
        tela.classList.remove("ativa");
    });

    document.getElementById(nome).classList.add("ativa");
    atualizarSistema();
}

function atualizarSistema() {
    const total = materiais.length;
    const unidades = materiais.reduce((soma, item) => soma + item.quantidade, 0);
    const baixo = materiais.filter(item => item.quantidade <= item.minimo).length;

    document.getElementById("total").textContent = total;
    document.getElementById("unidades").textContent = unidades;
    document.getElementById("baixo").textContent = baixo;

    atualizarLista();
    atualizarSelect();
    atualizarHistorico();
}

function atualizarLista() {
    const lista = document.getElementById("listaEstoque");
    const vazio = document.getElementById("vazio");
    const busca = document.getElementById("busca").value.toLowerCase();

    lista.innerHTML = "";

    const filtrados = materiais.filter(item =>
        item.nome.toLowerCase().includes(busca) ||
        item.categoria.toLowerCase().includes(busca)
    );

    vazio.style.display = filtrados.length === 0 ? "block" : "none";

    filtrados.forEach(item => {
        const status = item.quantidade <= item.minimo
            ? "Estoque baixo"
            : "Disponível";

        const linha = document.createElement("tr");

        [item.nome, item.categoria, item.quantidade, item.minimo, status]
            .forEach(valor => {
                const celula = document.createElement("td");
                celula.textContent = valor;
                linha.appendChild(celula);
            });

        lista.appendChild(linha);
    });
}

function atualizarSelect() {
    const select = document.getElementById("material");
    const selecionado = select.value;

    select.innerHTML = '<option value="">Selecione um material</option>';

    materiais.forEach(item => {
        const opcao = document.createElement("option");
        opcao.value = item.id;
        opcao.textContent = item.nome;
        select.appendChild(opcao);
    });

    if (materiais.some(item => String(item.id) === selecionado)) {
        select.value = selecionado;
    }
}

function atualizarHistorico() {
    const area = document.getElementById("historico");
    area.innerHTML = "";

    historico.slice().reverse().forEach(registro => {
        const linha = document.createElement("p");
        linha.textContent =
            `${registro.data} — ${registro.tipo}: ${registro.quantidade} unidade(s) de ${registro.material}`;
        area.appendChild(linha);
    });
}

document.getElementById("formCadastro").addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const categoria = document.getElementById("categoria").value.trim();
    const quantidade = Number(document.getElementById("quantidade").value);
    const minimo = Number(document.getElementById("minimo").value);

    if (!nome || !categoria || quantidade < 0 || minimo < 0) {
        alert("Preencha os campos corretamente.");
        return;
    }

    const duplicado = materiais.some(item =>
        item.nome.toLowerCase() === nome.toLowerCase()
    );

    if (duplicado) {
        alert("Esse material já está cadastrado.");
        return;
    }

    materiais.push({
        id: Date.now(),
        nome,
        categoria,
        quantidade,
        minimo
    });

    salvarDados();
    atualizarSistema();
    this.reset();

    alert("Material cadastrado com sucesso!");
});

document.getElementById("formMovimentacao").addEventListener("submit", function(event) {
    event.preventDefault();

    const id = Number(document.getElementById("material").value);
    const tipo = document.getElementById("tipo").value;
    const quantidade = Number(document.getElementById("qtdMovimentacao").value);

    const item = materiais.find(material => material.id === id);

    if (!item || quantidade <= 0) {
        alert("Selecione um material e informe uma quantidade válida.");
        return;
    }

    if (tipo === "saida" && quantidade > item.quantidade) {
        alert("Não há quantidade suficiente em estoque.");
        return;
    }

    if (tipo === "entrada") {
        item.quantidade += quantidade;
    } else {
        item.quantidade -= quantidade;
    }

    historico.push({
        material: item.nome,
        tipo: tipo === "entrada" ? "Entrada" : "Saída",
        quantidade,
        data: new Date().toLocaleString("pt-BR")
    });

    salvarDados();
    atualizarSistema();
    this.reset();

    alert("Movimentação registrada com sucesso!");
});

document.getElementById("busca").addEventListener("input", atualizarLista);

atualizarSistema();