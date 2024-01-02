import express, { response } from 'express';
import crypto from 'crypto';
import querystring from 'querystring';

const router = express.Router(); // defining routes for express applications

const client_id = '6f19f08dc3534f848938b331e6229896';
const redirect_uri_callback = 'http://localhost:3000/callback';
const redirect_uri_getToken = 'http://localhost:3000/getToken';

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

router.route('/').get( async function(req, res) {
  let state = generateRandomString(128);
  let codeVerifier = generateRandomString(128);
  // window.localStorage.setItem('code_verifier', code_verifier);
  // code_verifier = codeVerifier
  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64encode(hashed);  
  let scope = 'user-read-private user-read-email user-library-read';
  const redirect_search = querystring.stringify({
    client_id: client_id,
    response_type: 'code',
    redirect_uri: redirect_uri_callback,
    state: state,
    scope: scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });
  res.redirect('https://accounts.spotify.com/authorize?' + redirect_search);
});

export default router;