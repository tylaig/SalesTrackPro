# TODO - Sistema de Vendas e Webhook

## Problemas Identificados (URGENTE)

### 1. ✗ Corrigir erro no webhook
- **Problema**: Erro "Cannot read properties of undefined (reading 'phone')" 
- **Causa**: Estrutura do payload ABANDONED_CART está em array com propriedade 'body'
- **Localização**: server/routes.ts linha ~318
- **Ação**: Corrigir parsing do payload para eventos em formato array

### 2. ✗ Remover aba "Suporte" do menu lateral
- **Problema**: Aba existe mas página foi removida do sistema
- **Localização**: client/src/components/navigation/Sidebar.tsx
- **Ação**: Remover entrada "Suporte" do array navigation

### 3. ✗ Remover formulário de suporte do Dashboard
- **Problema**: Dashboard ainda mostra formulário de suporte que não existe mais
- **Localização**: client/src/pages/Dashboard.tsx
- **Ação**: Remover componente/seção de suporte do dashboard

## Tarefas de Manutenção

### 4. ✗ Atualizar replit.md
- Documentar correções feitas
- Atualizar arquitetura atual
- Registrar remoção completa do sistema de suporte

### 5. ✗ Testar sistema webhook completo
- Testar PIX_GENERATED
- Testar SALE_APPROVED 
- Testar ABANDONED_CART (após correção)
- Verificar criação automática de clientes
- Verificar lógica de recuperação

## Status
- [x] Erro webhook corrigido
- [x] Menu lateral limpo
- [x] Dashboard limpo
- [x] Documentação atualizada
- [x] Testes completos

## Webhook System Funcionando
- PIX_GENERATED: Cria vendas pendentes ✓
- SALE_APPROVED: Marca vendas como realizadas/recuperadas ✓
- ABANDONED_CART: Registra vendas perdidas ✓
- Cliente criado automaticamente por telefone ✓
- UTMs e dados originais preservados ✓

## Notas
- Sistema focado apenas em: vendas, clientes, relatórios, super admin, webhook test
- Suporte foi completamente removido do sistema
- Webhook deve processar três tipos de eventos com estruturas diferentes