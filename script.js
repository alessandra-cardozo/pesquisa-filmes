const APIKEY = "db062eef61bbade8e68dc0439adeafb4";
const BASEURL = "https://api.themoviedb.org/3";

// 🚫 Filtro mais rigoroso: exclui adultos e restringe classificação
const APIURL = `${BASEURL}/discover/movie?sort_by=popularity.desc&include_adult=false&certification_country=BR&certification.lte=12&api_key=${APIKEY}&language=pt-BR&page=`;
const SEARCHAPI = `${BASEURL}/search/movie?api_key=${APIKEY}&language=pt-BR&include_adult=false&query=`;
const IMGPATH = "https://image.tmdb.org/t/p/w1280";

const main = document.querySelector("main");
const form = document.querySelector("form");
const search = document.querySelector(".search");
const toggleTheme = document.getElementById("toggleTheme");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const currentPageEl = document.getElementById("currentPage");

let currentPage = 1;
let currentQuery = "";
let isSearchMode = false;

getMovies(APIURL + currentPage);

async function getMovies(url) {
  const resp = await fetch(url);
  const respData = await resp.json();

  // 🛡️ Filtra manualmente conteúdos marcados como adultos
  const safeResults = respData.results.filter((movie) => !movie.adult);

  showMovies(safeResults);
  currentPageEl.textContent = `Página ${currentPage}`;
}

function showMovies(movies) {
  main.innerHTML = "";

  movies.forEach(async (movie) => {
    const { id, title, poster_path, vote_average, overview } = movie;
    const trailer = await getTrailer(id);
    const isFav = checkFavorite(id);

    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");

    movieEl.innerHTML = `
      <img src="${IMGPATH + poster_path}" alt="${title}" />
      <div class="movie-info">
        <h3>${title}</h3>
        <span class="${getClassByRate(vote_average)}">${vote_average.toFixed(1)}</span>
      </div>
      <div class="overview">
        <h2>Sinopse:</h2>
        <p>${overview}</p>
        ${trailer ? `<iframe src="${trailer}" allowfullscreen></iframe>` : "<p>Trailer não disponível.</p>"}
        <button onclick="toggleFavorite(${id})">
          ${isFav ? "💖 Remover dos Favoritos" : "🤍 Favoritar"}
        </button>
      </div>
    `;
    main.appendChild(movieEl);
  });
}

function getClassByRate(vote) {
  return vote >= 8 ? "green" : vote >= 5 ? "orange" : "red";
}

async function getTrailer(id) {
  const res = await fetch(`${BASEURL}/movie/${id}/videos?api_key=${APIKEY}&language=pt-BR`);
  const data = await res.json();
  const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = search.value.trim();
  if (searchTerm) {
    isSearchMode = true;
    currentQuery = searchTerm;
    currentPage = 1;
    getMovies(`${SEARCHAPI}${searchTerm}&page=${currentPage}`);
    search.value = "";
  }
});

toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

function toggleFavorite(id) {
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  if (favs.includes(id)) {
    favs = favs.filter(favId => favId !== id);
  } else {
    favs.push(id);
  }
  localStorage.setItem("favorites", JSON.stringify(favs));
  refreshCurrentView();
}

function checkFavorite(id) {
  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  return favs.includes(id);
}

nextBtn.addEventListener("click", () => {
  currentPage++;
  refreshCurrentView();
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    refreshCurrentView();
  }
});

function refreshCurrentView() {
  if (isSearchMode && currentQuery) {
    getMovies(`${SEARCHAPI}${currentQuery}&page=${currentPage}`);
  } else {
    getMovies(APIURL + currentPage);
  }
}
