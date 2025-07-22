FROM node:18

WORKDIR /app

# package.json varsa önce onu kopyala
COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3005

CMD ["npm", "run", "dev"]