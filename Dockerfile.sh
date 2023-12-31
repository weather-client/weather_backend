docker build . -t weather-app-backend
docker stop weather-app-backend; docker rm weather-app-backend

docker run -d --name weather-app-backend -p 3000:3000 --restart always \
    --mount type=bind,source=$HOME/repos/weather_backend/serviceAccountKey.json,target=/usr/src/app/serviceAccountKey.json \
    weather-app-backend 