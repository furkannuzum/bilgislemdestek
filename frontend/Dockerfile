FROM node:20

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install --verbose

COPY . .                  

EXPOSE 3005

CMD ["npm","run","dev"]