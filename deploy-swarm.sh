#!/bin/bash

# Script de deploy para Docker Swarm
# Execute: chmod +x deploy-swarm.sh && ./deploy-swarm.sh

set -e

echo "🚀 Iniciando deploy do Sales Dashboard no Docker Swarm..."

# Verificar se o swarm está ativo
if ! docker info | grep -q "Swarm: active"; then
    echo "❌ Docker Swarm não está ativo. Inicializando..."
    docker swarm init
fi

# Construir a imagem
echo "📦 Construindo imagem Docker..."
docker build -f Dockerfile.production -t sales-dashboard:latest .

# Tag para registry (ajuste conforme necessário)
# docker tag sales-dashboard:latest your-registry/sales-dashboard:latest
# docker push your-registry/sales-dashboard:latest

# Deploy no swarm
echo "🔄 Fazendo deploy no Docker Swarm..."
docker stack deploy -c docker-compose.swarm.yml sales-dashboard

echo "✅ Deploy concluído!"
echo "📊 Para verificar o status: docker service ls"
echo "📋 Para ver logs: docker service logs sales-dashboard_sales-dashboard"
echo "🌐 Aplicação disponível em: http://localhost:5000"