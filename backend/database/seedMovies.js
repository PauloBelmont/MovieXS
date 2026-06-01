//Utilitário para popular database com os filmes

require('dotenv').config({ path: "../.env" });
const axios = require('axios');
const mongoose = require('mongoose');
const connectDB = require("./database");
const {Movie} = require("../models/Schemas");
const { sleep } = require("../util/helpers");

connectDB();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const GENRE_LIST_URL = 'https://api.themoviedb.org/3/genre/movie/list';
const MAX_PAGES = 20;
const DELAY_BETWEEN_REQUESTS = 20;

let genreTranslations = {};

const fetchGenres = async () => {
    try {
        const response = await axios.get(`${GENRE_LIST_URL}?api_key=${API_KEY}&language=en-US`);
        const genres = response.data.genres;
        genreTranslations = genres.reduce((acc, genre) => {
            acc[genre.id] = genre.name;
            return acc;
        }, {});
        console.log('Nomes dos gêneros obtidos com sucesso');
    } catch (err) {
        console.error('Erro ao obter o nome dos gêneros:', err.response?.data || err.message);
    }
};

const translateGenres = (genreIds) => {
    return genreIds.map(id => genreTranslations[id] || `Unknown (${id})`);
};

const fetchAdditionalMovieData = async (tmdbId) => {
  try {
    const [credits, keywords, providers] = await Promise.all([
      axios.get(`${BASE_URL}/movie/${tmdbId}/credits?api_key=${API_KEY}`),
      axios.get(`${BASE_URL}/movie/${tmdbId}/keywords?api_key=${API_KEY}`),
      axios.get(`${BASE_URL}/movie/${tmdbId}/watch/providers?api_key=${API_KEY}`)
    ]);

    return {
      cast: credits.data.cast.slice(0, 5).map(actor => actor.name),
      directors: credits.data.crew
        .filter(member => member.job === "Director")
        .map(director => director.name),
      keywords: keywords.data.keywords.slice(0, 10).map(kw => kw.name),
      streaming_providers: providers.data.results?.US?.flatrate?.map(p => ({
        provider_id: p.provider_id,
        logo_path: p.logo_path,
        provider_name: p.provider_name
      })) || []
    };
  } catch (err) {
    console.error(`Error fetching additional data for ${tmdbId}:`, err.message);
    return {};
  }
};

//Adiciona informações extras no filme (Atores, palavras-chave e Serviços que proveem)
const processMovie = async (baseMovie) => {
    try {
      const additionalData = await fetchAdditionalMovieData(baseMovie.id);
      
      return new Movie({
        tmdb_id: baseMovie.id,
        title: baseMovie.title,
        overview: baseMovie.overview,
        release_date: baseMovie.release_date,
        genres: translateGenres(baseMovie.genre_ids),
        popularity: baseMovie.popularity,
        vote_average: baseMovie.vote_average,
        vote_count: baseMovie.vote_count,
        poster_path: baseMovie.poster_path,
        backdrop_path: baseMovie.backdrop_path,
        ...additionalData
      });
    } catch (err) {
      console.error(`Error processing movie ${baseMovie.id}:`, err);
      return null;
    }
  };

const fetchAndStoreMovies = async () => {
    console.log('Fetching movies from TMDB...');
    
    for (let page = 1; page <= MAX_PAGES; page++) {
      try {
        const response = await axios.get(
          `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
        );
        
        const movies = await Promise.all(
          response.data.results.map(async (movie) => {
            await sleep(DELAY_BETWEEN_REQUESTS);
            return processMovie(movie);
          })
        );
  
        const validMovies = movies.filter(movie => movie !== null);
        
        // Save each movie individually to handle duplicates
        let savedCount = 0;
        let duplicateCount = 0;
        for (const movie of validMovies) {
          try {
            await movie.save();
            savedCount++;
          } catch (err) {
            if (err.code === 11000) {
              console.log(`Duplicate movie skipped (tmdb_id: ${movie.tmdb_id})`);
              duplicateCount++;
            } else {
              console.error(`Error saving movie ${movie.tmdb_id}:`, err.message);
            }
          }
        }
        
        console.log(`Page ${page}/${MAX_PAGES}: ${savedCount} saved, ${duplicateCount} duplicates skipped`);
  
      } catch (err) {
        console.error(`Error processing page ${page}:`, err.message);
        if(err.response?.status === 429) {
          console.log('Rate limit hit - adding 10 second delay');
          await sleep(10000);
        }
      }
    }
    
    mongoose.connection.close();
    console.log('Movie seeding completed');
  };

const run = async () => {
    await fetchGenres();
    fetchAndStoreMovies();
};

run();