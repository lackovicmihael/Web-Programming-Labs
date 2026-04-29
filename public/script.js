let sviFilmovi = [];
let kosarica = [];

// =====================
// DOHVAT CSV
// =====================
fetch("movies.csv")
  .then(res => res.text())
  .then(csv => {

    const rezultat = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true
    });

    sviFilmovi = rezultat.data.map(f => ({
      naslov: f.Naslov,
      godina: Number(f.Godina),
      zanrovi: f.Zanr.split(",").map(z => z.trim()), // ✅ FIX: split na više žanrova
      trajanje: Number(f.Trajanje_min),
      drzava: f.Zemlja_porijekla?.split(",").map(d => d.trim()) || [],
      ocjena: Number(f.Ocjena)
    }));

    popuniZanrove();
    prikaziTablicu(sviFilmovi.slice(0, 30));
  });


// =====================
// TABLICA
// =====================
function prikaziTablicu(filmovi) {
  const tbody = document.querySelector("#filmovi-tablica tbody");
  tbody.innerHTML = "";

  filmovi.forEach(film => {

    const tr = document.createElement("tr");

    const uKosarici = kosarica.some(k => k.naslov === film.naslov);

    const btnDisabled = uKosarici ? "disabled" : "";

    tr.innerHTML = `
      <td>${film.naslov}</td>
      <td>${film.godina}</td>
      <td>${film.zanrovi.join(", ")}</td>
      <td>${film.trajanje}</td>
      <td>${film.drzava.join(", ")}</td>
      <td>${film.ocjena}</td>
      <td>
        <button ${btnDisabled}>Dodaj</button>
      </td>
    `;

    const btn = tr.querySelector("button");

    if (!uKosarici) {
      btn.onclick = () => dodajUKosaricu(film);
    }

    tbody.appendChild(tr);
  });
}


// =====================
// POPUNI ŽANROVE (POJEDINAČNI)
// =====================
function popuniZanrove() {
  const select = document.getElementById("filter-zanr");

  const sviZanrovi = new Set();

  sviFilmovi.forEach(f => {
    f.zanrovi.forEach(z => sviZanrovi.add(z));
  });

  [...sviZanrovi].sort().forEach(z => {
    const opt = document.createElement("option");
    opt.value = z;
    opt.textContent = z;
    select.appendChild(opt);
  });
}


// =====================
// FILTERI
// =====================
document.getElementById("filter-ocjena").addEventListener("input", e => {
  document.getElementById("ocjena-value").textContent = e.target.value;
});

document.getElementById("filtriraj").addEventListener("click", () => {

  const naziv = document.getElementById("filter-naziv").value.toLowerCase();
  const zanr = document.getElementById("filter-zanr").value;
  const od = Number(document.getElementById("godina-od").value);
  const doG = Number(document.getElementById("godina-do").value);
  const drzava = document.getElementById("filter-drzava").value.toLowerCase();
  const ocjena = Number(document.getElementById("filter-ocjena").value);

  let filtrirani = sviFilmovi.filter(f => {

    const zanrMatch =
      !zanr || f.zanrovi.includes(zanr); // ✅ FIX: OR logika po žanru

    return (
      (!naziv || f.naslov.toLowerCase().includes(naziv)) &&
      zanrMatch &&
      (!od || f.godina >= od) &&
      (!doG || f.godina <= doG) &&
      (!drzava || f.drzava.some(d => d.toLowerCase().includes(drzava))) &&
      (f.ocjena >= ocjena)
    );
  });

  prikaziTablicu(filtrirani);
});


// =====================
// KOŠARICA
// =====================
function dodajUKosaricu(film) {
  if (!kosarica.some(k => k.naslov === film.naslov)) {
    kosarica.push(film);
    osvjeziKosaricu();
    prikaziTablicu(sviFilmovi); // refresh da se gumb disable-a
  }
}

function osvjeziKosaricu() {
  const lista = document.getElementById("lista-kosarice");
  lista.innerHTML = "";

  kosarica.forEach((film, i) => {
    const li = document.createElement("li");
    li.textContent = film.naslov;

    const btn = document.createElement("button");
    btn.textContent = "Ukloni";

    btn.onclick = () => {
      kosarica.splice(i, 1);
      osvjeziKosaricu();
      prikaziTablicu(sviFilmovi); // refresh button state
    };

    li.appendChild(btn);
    lista.appendChild(li);
  });
}


// =====================
// POTVRDA
// =====================
document.getElementById("potvrdi").addEventListener("click", () => {
  if (kosarica.length === 0) {
    alert("Košarica prazna!");
  } else {
    alert(`Uspješno ste dodali ${kosarica.length} filmova!`);
    kosarica = [];
    osvjeziKosaricu();
    prikaziTablicu(sviFilmovi);
  }
});