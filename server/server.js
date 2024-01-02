import express, { response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import querystring from 'querystring';
import axios from 'axios';
import oauth from './routes/oauth.js';

const app = express();
const allowed_origin = ['http://localhost:3000']

const client_id = '6f19f08dc3534f848938b331e6229896';
const redirect_uri = 'http://localhost:3000/callback';
let access_token = null;
let current_code_verifier = null;

// Data structure that manages the current active token, caching it in localStorage
const currentToken = {
  get access_token() { return localStorage.getItem('access_token') || null; },
  get refresh_token() { return localStorage.getItem('refresh_token') || null; },
  get expires_in() { return localStorage.getItem('refresh_in') || null },
  get expires() { return localStorage.getItem('expires') || null },

  save: function (response) {
    const { access_token, refresh_token, expires_in } = response;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('expires_in', expires_in);

    const now = new Date();
    const expiry = new Date(now.getTime() + (expires_in * 1000));
    localStorage.setItem('expires', expiry);
  }
};

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowed_origin.includes(origin)) {
      callback(null, true);
    }
    else {
      callback(new Error('not allowed by cors'));
    }
  },
  credentials: true
}));
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ "user1": [1, 2, 3] })
});

app.get('/login', async function(req, res) {
  let state = generateRandomString(128);
  let codeVerifier = generateRandomString(128);
  // window.localStorage.setItem('code_verifier', code_verifier);
  current_code_verifier = codeVerifier
  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64encode(hashed);  
  let scope = 'user-read-private user-read-email user-library-read';
  const redirect_search = querystring.stringify({
    client_id: client_id,
    response_type: 'code',
    redirect_uri: redirect_uri,
    state: state,
    scope: scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });
  res.redirect('https://accounts.spotify.com/authorize?' + redirect_search);
});

app.post('/callback', async function(req, res) {
  const { authCode } = req.body;
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: client_id,
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: redirect_uri,
      code_verifier: current_code_verifier
    }),
  }
  const body = await fetch("https://accounts.spotify.com/api/token", payload);
  const response = await body.json();
  console.log("response is", response);
  if (response) {
    access_token = response.access_token;
    res.status(200).json({ access_token: response.access_token });
  }
  else {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(8080, () => {
  console.log("server started on port 8080")
});
