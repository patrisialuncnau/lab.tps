const url = "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json";

const colonne = [
  "data",
  "nuovi_positivi",
  "terapia_intensiva",
  "ricoverati_con_sintomi",
  "dimessi_guariti",
  "deceduti",
  "totale_casi"
];
async function caricaDati() {
  const stato = document.getElementById("stato");
  try {
    const risposta = await fetch(url);
    if (!risposta.ok) {
      throw new Error("Risposta HTTP " + risposta.status);
    }
    const dati = await risposta.json();

    const chiavi = Object.keys(dati[0]);
    const corpoChiavi = document.getElementById("tabella-chiavi");
    chiavi.forEach(function (chiave) {
      const riga = document.createElement("tr");
      const cella = document.createElement("td");
      cella.textContent = chiave;
      riga.appendChild(cella);
      corpoChiavi.appendChild(riga);
    });
    const intestazione = document.getElementById("intestazione-dati");
    const rigaIntestazione = document.createElement("tr");
    colonne.forEach(function (colonna) {
      const th = document.createElement("th");
      th.textContent = colonna;
      rigaIntestazione.appendChild(th);
    });
    intestazione.appendChild(rigaIntestazione);

    const ultimiDati = dati.slice(-20).reverse();
    const corpoDati = document.getElementById("tabella-dati");
    ultimiDati.forEach(function (elemento) {
      const riga = document.createElement("tr");
      colonne.forEach(function (colonna) {
        const cella = document.createElement("td");
        cella.textContent = elemento[colonna] ?? "-";
        riga.appendChild(cella);
      });
      corpoDati.appendChild(riga);
    });
    stato.textContent = "Dati caricati: " + dati.length + " rilevamenti. " +
      "La tabella mostra i 20 più recenti.";
  } catch (errore) {
    stato.textContent = "Impossibile caricare i dati. Controlla la connessione e riprova.";
    console.error("Errore durante il caricamento del JSON:", errore);
  }
}
caricaDati();
