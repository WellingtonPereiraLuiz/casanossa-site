# Casanossa - Imobiliária e Gestão de Imóveis

Uma aplicação moderna e completa para a gestão e exibição de catálogo de imóveis, criada com as melhores práticas de desenvolvimento web. O sistema conta com um site público para clientes e um painel administrativo poderoso para gestão de leads e propriedades.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React.js com Vite
- **Estilização**: Tailwind CSS (com tema de marca customizado)
- **Animações**: Framer Motion
- **Mapas**: React Leaflet (OpenStreetMap)
- **Ícones**: Lucide React
- **Backend / Banco de Dados**: Supabase (PostgreSQL + Auth + Storage)
- **Roteamento**: React Router DOM

## ✨ Funcionalidades Principais

### Visão Pública (Site)
- Catálogo de imóveis dinâmico com filtros avançados (Finalidade, Tipo, Quartos, Banheiros, Vagas, Valor Mínimo/Máximo, Categoria e Bairro).
- Exibição de imóveis detalhados, incluindo galeria de fotos, mapa e informações principais.
- Recomendações inteligentes de imóveis semelhantes usando um algoritmo de pontuação com base em similaridade (bairro, valor, cômodos, etc).
- Formulários de contato otimizados com auto-formatação e validação rigorosa (máscaras de telefone e validação de email regex).

### Painel Administrativo (Área Restrita /admin)
- **Login Protegido**: Sistema de autenticação integrado ao Supabase.
- **Gestão de Imóveis**: 
  - Listagem completa, edição, cadastro e deleção (inclusive ações em massa).
  - Listas inteligentes: As categorias, bairros e tipos são populados de forma dinâmica baseando-se no que já existe no banco, sem a necessidade de telas adicionais de gestão.
  - Informações de Contrato: Ao marcar um imóvel como Alugado ou Vendido, o administrador pode salvar detalhes (nome do cliente, valor, data e observações de contrato), que ficam salvos de forma segura em uma estrutura JSON.
  - Compartilhamento inteligente via WhatsApp diretamente do painel.
- **Gestão de Leads**: 
  - Recebimento de mensagens pelo site, filtradas por "Novos" e "Lidos/Respondidos" com salvamento de contexto (aba ativa é mantida via cache local).
  - Marcar como lido ou não lido e deleção em massa.
  - Layout limpo e organizado com limitação visual para nomes ou emails muito grandes.
  - Botão de envio rápido via WhatsApp.

## 🛠️ Como rodar o projeto localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configuração de Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto contendo as suas chaves do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
   ```

3. **Configuração do Supabase (Banco de Dados):**
   Certifique-se de que o seu banco contém as seguintes tabelas com as respectivas colunas e RLS corretamente ajustado:
   - **`properties`**: id, titulo, codigo, preco, finalidade, tipo, categoria, bairro, cidade, uf, latitude, longitude, area_m2, quartos, banheiros, vagas, descricao, status (text), info_contrato (jsonb).
   - **`property_images`**: id, property_id (fk), url, posicao.
   - **`leads`**: id, nome, email, telefone, mensagem, criado_em, status (text, default: 'novo').
   - **`property_analytics`**: Para controle de métricas e acessos.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. O site estará disponível em `http://localhost:5173`. Para acessar a administração, navegue para `/admin`.

---
Desenvolvido para entregar a melhor experiência imobiliária!
