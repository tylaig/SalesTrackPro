#!/bin/bash

# Script de deploy para Docker Swarm - Vidente14Pontos
# Execute: chmod +x deploy-swarm.sh && ./deploy-swarm.sh

set -e

echo "🚀 Iniciando deploy do Dashboard Vidente14Pontos..."

# Verificar se o volume existe
if ! docker volume inspect vidente14pontos >/dev/null 2>&1; then
    echo "📦 Criando volume vidente14pontos..."
    docker volume create vidente14pontos
fi

# Verificar se a rede existe
if ! docker network inspect MSAppRede >/dev/null 2>&1; then
    echo "🌐 Criando rede MSAppRede..."
    docker network create --driver overlay --attachable MSAppRede
fi

# Deploy no swarm
echo "🔄 Fazendo deploy no Docker Swarm..."
docker stack deploy -c docker-stack-vidente14pontos.yml vidente14pontos

echo "✅ Deploy concluído!"
echo "📊 Para verificar o status: docker service ls"
echo "📋 Para ver logs: docker service logs vidente14pontos_crm-app"
echo "🌐 Aplicação disponível em: https://dashboard.vidente14pontos.meusuper.app"
echo "⚠️  O primeiro start pode demorar alguns minutos (download e instalação)"