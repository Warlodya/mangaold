FROM node:20-slim

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build
RUN npx prisma generate

CMD ["npm", "run", "start", "--", "-p", "4000"]
