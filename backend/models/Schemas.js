//Arquivo com os Schemas e modelos mongoDB

const {Schema,model} = require('mongoose')

//Schemas mongoDB
const movieSchema = new Schema({
  tmdb_id: { type: Number, unique: true },
  title: String,
  overview: String,
  release_date: Date,
  genres: [String],
  popularity: Number,
  vote_average: Number,
  vote_count: Number,
  poster_path: String,
  backdrop_path: String,
  cast: [String],
  directors: [String],
  keywords: [String],
  streaming_providers: [{
    provider_id: String,
    logo_path: String,
    provider_name: String
  }]
}, { timestamps: true });

const ratingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  timestamp: { type: Date, default: Date.now }
});

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // E-mail opcional por ora (usuários de seed antigos não têm); sparse permite múltiplos null sem violar o unique
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

//Modelos
const Movie = model('Movie', movieSchema);
const User = model('User', userSchema);
const Rating = model('Rating', ratingSchema);

module.exports = { Movie,User,Rating };