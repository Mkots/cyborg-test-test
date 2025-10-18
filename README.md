# Setup server
1. Generate `AUTH_TOKEN`
```
uuidgen > api_token
```
2. Generate `AUTH_SECRET`
```
openssl rand -base64 32 > auth_secret
```
3. Run server
```
docker run -p 3000:3000 \
  -e API_TOKEN="$(cat api_token)" \
  -e AUTH_SECRET="$(cat auth_secret)" \
  -v /path/on/host:/app/data \
  ghcr.io/cyborgtests/playwright-reports-server:latest
```