/* -------------------------
   HELPERS
-------------------------- */
const $ = (sel) => document.querySelector(sel);

function message(text, type="success") {
  const box = $("#global");
  box.style.display = "block";
  box.className = "";
  
  if (type === "success") box.classList.add("global-success");
  if (type === "error") box.classList.add("global-error");
  if (type === "warning") box.classList.add("global-warning");

  box.textContent = text;
}

/* -------------------------
   STORAGE
-------------------------- */
function save(data) {
  const old = JSON.parse(localStorage.getItem("proesp") || "{}");
  localStorage.setItem("proesp", JSON.stringify({...old, ...data}));
}

function load() {
  return JSON.parse(localStorage.getItem("proesp") || "{}");
}

/* -------------------------
   VALIDADORES
-------------------------- */
function minLen(input, len) {
  const msg = $(`#msg-${input.id}`);
  if (input.value.trim().length < len) {
    input.classList.add("invalid");
    msg.textContent = `Mínimo ${len} caracteres.`;
    return false;
  }
  input.classList.remove("invalid");
  msg.textContent = "";
  return true;
}

function numRange(input, min, max) {
  const msg = $(`#msg-${input.id}`);
  const v = Number(input.value);

  if (isNaN(v)) {
    msg.textContent = "Digite um número.";
    input.classList.add("invalid");
    return false;
  }
  if (v < min || v > max) {
    msg.textContent = `Valor entre ${min} e ${max}.`;
    input.classList.add("invalid");
    return false;
  }
  input.classList.remove("invalid");
  msg.textContent = "";
  return true;
}

/* -------------------------
   TRIAGEM (index.html)
-------------------------- */
if ($("#triagem")) {
  const nome = $("#nome");
  const nasc = $("#nasc");
  const parqSim = $("#parq-sim");
  const parqNao = $("#parq-nao");

  const state = load();
  if (state.nome) nome.value = state.nome;
  if (state.nasc) nasc.value = state.nasc;
  if (state.parq === "sim") parqSim.checked = true;
  if (state.parq === "nao") parqNao.checked = true;

  nome.addEventListener("blur", () => minLen(nome, 3));
  nasc.addEventListener("blur", () => minLen(nasc, 10));

  $("#simular-triagem").onclick = () => {
    nome.value = "Aluno Simulado A";
    nasc.value = "2009-05-20";
    parqNao.checked = true;

    save({nome: nome.value, nasc: nasc.value, parq: "nao"});
    message("Dados simulados preenchidos.");
  };

  $("#form-triagem").onsubmit = (e) => {
    e.preventDefault();

    const v1 = minLen(nome, 3);
    const v2 = nasc.value !== "";

    if (parqSim.checked) {
      message("PAR-Q = SIM → Não pode avançar (simulado).", "warning");
      return;
    }

    if (!v1 || !v2) {
      message("Preencha corretamente.", "error");
      return;
    }

    save({
      nome: nome.value,
      nasc: nasc.value,
      parq: parqSim.checked ? "sim" : "nao"
    });

    message("Avançando...", "success");
    setTimeout(() => (window.location = "antropometria.html"), 500);
  };
}

/* -------------------------
   ANTROPOMETRIA
-------------------------- */
if ($("#antropometria")) {
  const altura = $("#altura");
  const peso = $("#peso");

  const st = load();
  if (st.altura) altura.value = st.altura;
  if (st.peso) peso.value = st.peso;

  altura.addEventListener("blur", () => numRange(altura, 50, 250));
  peso.addEventListener("blur", () => numRange(peso, 20, 250));

  $("#simular-antro").onclick = () => {
    altura.value = 165;
    peso.value = 57;
    save({altura: 165, peso: 57});
    message("Medidas simuladas adicionadas.");
  };

  $("#form-antro").onsubmit = (e) => {
    e.preventDefault();

    const ok1 = numRange(altura, 50, 250);
    const ok2 = numRange(peso, 20, 250);

    if (!ok1 || !ok2) {
      message("Valores inválidos.", "error");
      return;
    }

    save({altura: altura.value, peso: peso.value});
    message("Avançando...", "success");
    setTimeout(()=> window.location = "testesmotores.html", 500);
  };

  $("#back-triagem").onclick = () => window.location = "index.html";
}

/* -------------------------
   TESTES MOTORES
-------------------------- */
if ($("#motores")) {
  const campos = [
    ["medicine", 0, 20],
    ["salto", 0, 400],
    ["abd", 0, 200],
    ["corrida20", 1, 20],
    ["agilidade", 2, 100],
    ["corrida6", 0, 3000]
  ];

  const st = load();
  campos.forEach(([id]) => {
    if (st[id]) $(`#${id}`).value = st[id];
  });

  campos.forEach(([id, min, max]) => {
    const campo = $(`#${id}`);
    campo.addEventListener("blur", () => numRange(campo, min, max));
  });

  $("#simular-motores").onclick = () => {
    $("#medicine").value = 4.3;
    $("#salto").value = 190;
    $("#abd").value = 32;
    $("#corrida20").value = 3.4;
    $("#agilidade").value = 16;
    $("#corrida6").value = 1500;

    campos.forEach(([id]) => save({[id]: $(`#${id}`).value}));
    message("Simulação aplicada.");
  };

  $("#form-motores").onsubmit = (e) => {
    e.preventDefault();

    let ok = true;
    campos.forEach(([id, min, max]) => {
      if (!numRange($(`#${id}`), min, max)) ok = false;
    });

    if (!ok) {
      message("Existem valores inválidos.", "error");
      return;
    }

    message("Dados registrados (simulado).", "success");
  };

  $("#back-antro").onclick = () => window.location = "antropometria.html";
}
