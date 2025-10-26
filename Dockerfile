FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install -g expo-cli
RUN npm install

COPY . .

EXPOSE 8081 19000 19001 19002 19006 

CMD ["npx", "expo", "start", "--lan"]

