docker build . -t weather-app-backend
docker stop weather-app-backend; docker rm weather-app-backend

docker run -d --name weather-app-backend -p 3000:3000 --restart always weather-app-backend