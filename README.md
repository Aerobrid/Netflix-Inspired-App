
## Website Link
[Deployed using Render](https://netflix-clone-olcs.onrender.com) 

## Grafana Dashboard Demo

<img width="1852" height="876" alt="Screenshot 2026-01-01 163019" src="https://github.com/user-attachments/assets/3b57e18e-c014-4b5a-b78c-290323da8343" />
<img width="1852" height="875" alt="Screenshot 2026-01-01 162833" src="https://github.com/user-attachments/assets/66c220d2-8ac2-49f6-808a-c0037b84200e" />

## env

Create a `.env` file in the project root from the provided `.env.sample` and fill in your values:

```powershell
copy .env.sample .env
```

Environment variables (see `.env.sample`):

- `PORT` — port the Node backend listens on (default: `5000`).
- `MONGO_URI` — MongoDB connection URI for your database.
- `NODE_ENV` — `development` or `production`.
- `JWT_SECRET` — secret used to sign JWT tokens.
- `TMDB_API_KEY` — The Movie DB API key used by the frontend/backend for movie data.

## Updates

- Deployed to DigitalOcean Droplet, but can be easily configured for AWS, GCP, Azure, Hostinger, etc.
- Implemented GitLab CI-CD pipeline with Github Actions mirror workflow
- Added Jest Testing
- Added Prometheus with Grafana to monitor app containers locally for development + Docker Compose
- Deployed Docker image to AWS Elastic Container Registry
- Created an AWS Elastic Compute Cloud (EC2) instance to pull the ECR Docker image 
- Deployed app using NGINX reverse proxy with valid domain name and SSL certification through certbot
- Updated React dependencies according to CVE-2025-55182 security vulnerability
- Added head endpoint to ping website via UptimeRobot. 
- Added GET endpoint to ping for MongoDB cluster via Cronitor. This makes it so that the link above is hopefully running 24/7. Note that this is a demo and service may be **unavailable at times**. 

## How to run when cloning 
> **Note 1:** You will need to install Visual C++ Redistributable for running tests with mongodb-memory-server <br />
> **Note 2:** This app is not guaranteed to instantly work with all node versions. You may need to play around with it.

If you instead download project as zip: <br />

- (Optional) Run this in the main folder and then go into the frontend folder to run **npm install** again to get proper dependencies:
    ```
    npm install
    ```
- To prepare for deployment 
    ```
    npm run build
    ```
- Start Application
    ```
    npm run start
    ```
