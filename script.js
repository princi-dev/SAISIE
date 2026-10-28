// 1. LISITRY NY EMAIL SY PASSWORD MAROMARO AZO AMPASINA
const KREDANSIALY_LISTITRA = [
  { email: "admin@gmail.com", password: "123" },
  { email: "princi@gmail.com", password: "456" },
  { email: "patrick@gmail.com", password: "789" },
  { email: "saisie@gmail.com", password: "000" }
];

// URL Google Apps Script-nao
const googleSheetURL = "https://script.google.com/macros/s/AKfycbwL96fLAu9FU0SktZ95u9VoXxQH7NOvOgn8otESjMrajjbdOk9iRxBhWJYr6-e-_uc0UQ/exec";

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn") === "true") {
    hampisehoApp();
  } else {
    hampisehoLogin();
  }

  document.getElementById('form-login').addEventListener('submit', handrayConnexion);
  document.getElementById('btn-logout').addEventListener('click', hialaConnexion);
  document.getElementById('txt-date').valueAsDate = new Date();
  document.getElementById('btn-add-row').addEventListener('click', manampyAndalana);
  document.getElementById('btn-submit-all').addEventListener('click', halefaAnySheets);

  // Recherche rehefa miala eo amin'ny vata reference
  const refInput = document.getElementById('txt-ref');
  if (refInput) {
    refInput.addEventListener('blur', hitadyDataReference);
  }
});

// Fiasa mampiditra data ho azy (Auto-fill) avy amin'ny GET
function hitadyDataReference() {
  const refInput = document.getElementById('txt-ref');
  if (!refInput) return;
  const refValue = refInput.value.trim();

  const inputFamille = document.getElementById('txt-famille');
  const inputStatut = document.getElementById('txt-statut');
  const inputUnite = document.getElementById('txt-unite');

  if (!refValue) {
    if (inputFamille) inputFamille.value = '';
    if (inputStatut) inputStatut.value = '';
    if (inputUnite) inputUnite.value = '';
    return;
  }

  fetch(`${googleSheetURL}?ref=${encodeURIComponent(refValue)}`)
    .then(response => response.json())
    .then(data => {
      if (data && !data.error) {
        if (inputFamille) inputFamille.value = data.famille || '';
        if (inputStatut) inputStatut.value = data.statut || '';
        if (inputUnite) inputUnite.value = data.unite || '';
      } else {
        if (inputFamille) inputFamille.value = 'Tsy hita';
        if (inputStatut) inputStatut.value = 'Tsy hita';
        if (inputUnite) inputUnite.value = 'Tsy hita';
      }
    })
    .catch(error => {
      console.error("Olana teo am-pitanisana data: ", error);
    });
}

function handrayConnexion(e) {
  e.preventDefault();
  const inputEmail = document.getElementById('login-email').value.trim();
  const inputPassword = document.getElementById('login-password').value;
  const errorBlock = document.getElementById('login-error');

  const validUser = KREDANSIALY_LISTITRA.find(user => user.email === inputEmail && user.password === inputPassword);

  if (validUser) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", inputEmail); // Nampiana ity mba hitadidy ny email fidirana
    if (errorBlock) errorBlock.style.display = "none";
    hampisehoApp();
  } else {
    if (errorBlock) errorBlock.style.display = "block";
  }
}

function hampisehoApp() {
  const loginCont = document.getElementById('login-container');
  const appCont = document.getElementById('app-container');
  if (loginCont) loginCont.style.display = "none";
  if (appCont) appCont.style.display = "block";

  if (document.querySelectorAll('#table-body tr').length === 0) {
    manampyAndalana();
  }
}

function hampisehoLogin() {
  const loginCont = document.getElementById('login-container');
  const appCont = document.getElementById('app-container');
  if (loginCont) loginCont.style.display = "flex";
  if (appCont) appCont.style.display = "none";
}

function hialaConnexion() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail"); // Fafana koa ny email rehefa hiala
  document.getElementById('login-email').value = "";
  document.getElementById('login-password').value = "";
  hampisehoLogin();
}

function manampyAndalana() {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;

  const rowId = Date.now();
  const tr = document.createElement('tr');
  tr.setAttribute('id', `row-${rowId}`);

  tr.innerHTML = `
    <td>
      <select class="row-mag">
        <option value="053A">053A</option>
        <option value="053C">053C</option>
        <option value="053EC">053EC</option>
        <option value="053D">053D</option>
        <option value="053K">053K</option>
      </select>
    </td>
    <td><input type="text" class="row-loc" placeholder="Ex: ZONE DORMANT"></td>
    <td><input type="text" class="row-piece" placeholder="Arakaraka"></td>
    <td><input type="text" class="row-element" placeholder="Code"></td>
    <td><input type="number" class="row-qte" value="0" min="0"></td>
    <td><button type="button" class="btn-delete" onclick="hamafaAndalana('${rowId}')">X</button></td>
  `;

  tbody.appendChild(tr);
  tr.querySelector('.row-qte').addEventListener('input', manaoKajyKatretro);
  manaoKajyKatretro();
}

function hamafaAndalana(rowId) {
  const row = document.getElementById(`row-${rowId}`);
  if (row) {
    row.remove();
    manaoKajyKatretro();
  }
}

function manaoKajyKatretro() {
  const lines = document.querySelectorAll('#table-body tr');
  const lblLignes = document.getElementById('lbl-total-lignes');
  const lblQte = document.getElementById('lbl-total-qte');

  if (lblLignes) lblLignes.innerText = lines.length;

  let totalQte = 0;
  document.querySelectorAll('.row-qte').forEach(input => {
    const val = parseFloat(input.value);
    if (!isNaN(val)) {
      totalQte += val;
    }
  });

  if (lblQte) lblQte.innerText = totalQte;
}

function halefaAnySheets() {
  const daty = document.getElementById('txt-date').value;
  const dataInv = document.getElementById('txt-data').value;
  const reference = document.getElementById('txt-ref').value;
  const site = document.getElementById('txt-site').value;
  const agent = document.getElementById('txt-agent').value;
  const userEmail = localStorage.getItem("userEmail") || ""; // Alaina eto ilay email avy ao amin'ny localStorage

  if (!reference || !agent) {
    alert("Azafady, fenoina avokoa ny Référence sy ny Agent!");
    return;
  }

  const rows = document.querySelectorAll('#table-body tr');
  if (rows.length === 0) {
    alert("Ampidiro farafahakeliny andalana iray ny tabilao!");
    return;
  }

  let errorCount = 0;
  let successCount = 0;

  rows.forEach((row, index) => {
    const dataSaisieManontolo = {
      daty: daty,
      dataInv: dataInv,
      reference: reference,
      site: site,
      agent: agent,
      unite: document.getElementById('txt-unite').value,
      mag: row.querySelector('.row-mag').value,
      loc: row.querySelector('.row-loc').value,
      piece: row.querySelector('.row-piece').value,
      element: row.querySelector('.row-element').value,
      quantite: row.querySelector('.row-qte').value,
      statut: document.getElementById('txt-statut').value,
      famille: document.getElementById('txt-famille').value,
      email: userEmail // NAMBOARINA: Nampidirina eto ny email mba ho voaray any amin'ny doPost
    };

    fetch(googleSheetURL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(dataSaisieManontolo)
    })
    .then(() => {
      successCount++;
      if (successCount + errorCount === rows.length) {
        alert("Tontosa soa aman-tsara! Voasoratra ao amin'ny Google Sheets ny Saisie-nao.");
        document.getElementById('txt-ref').value = '';
        document.getElementById('table-body').innerHTML = '';
        manampyAndalana();
      }
    })
    .catch(error => {
      errorCount++;
      console.error(error);
    });
  });
}

// Variable mirakitra ny Password hijerena ny Sheets
const PASSWORD_SHEETS = "princi2026";
// Ny URL-n'ilay Google Sheets-nao
const realSheetURL = "https://docs.google.com/spreadsheets/d/10OqqbwfsWngzF5_0WHLsWmdqqwCN59w9JShP35tDygo/edit?usp=sharing";

document.getElementById('btn-open-sheets').addEventListener('click', () => {
  const dikaPassword = prompt("Ampidiro ny Teny Miafina hijerena ny Google Sheets:");
  if (dikaPassword === PASSWORD_SHEETS) {
    window.open(realSheetURL, '_blank');
  } else if (dikaPassword !== null) {
    alert("Teny miafina diso! Ianao ihany no afaka mijery ity takelaka ity.");
  }
});
