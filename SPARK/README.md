## Server IP 설정 : (`.env`)

```bash
HOST_IP=192.168.0.[서버IP]
```

## Docker Image 생성

```bash
docker build -f dockerfile.jupyter -t my-jupyter:latest .
docker build -f dockerfile.spark -t my-spark:latest .
```

## Docker Container 생성

```bash
docker compose up -d
```