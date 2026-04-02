
FROM node:20-alpine

WORKDIR /app
RUN addgroup -S app && adduser -S app -G app

COPY package*.json ./

RUN npm install --omit=dev --ignore-scripts && npm dedupe

COPY . .
RUN chown -R app:app /app

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "const n=require('net');const p=process.env.PORT||3000;const s=n.connect(p,'127.0.0.1');s.on('connect',()=>{s.destroy();process.exit(0)});s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),4000);"
USER app

CMD ["npm", "run", "start:both"]