# REGRAS DO PROJETO — Site Casanossa Imobiliária

## Idioma
- Todo texto visível ao usuário: Português do Brasil.
- Comentários no código: em português, curtos e didáticos (o dono é iniciante).

## Stack obrigatória (não trocar sem pedir)
- React 18 + Vite + JavaScript (JSX). NÃO usar TypeScript.
- React Router DOM v6 para todas as rotas.
- Tailwind CSS para todo o estilo. Proibido CSS inline solto e arquivos .css avulsos além do index.css do Tailwind.
- Supabase (@supabase/supabase-js) para banco, login e storage.
- Leaflet + react-leaflet (OpenStreetMap) para mapas. NÃO usar Google Maps.
- lucide-react para ícones.

## Regra CRÍTICA de navegação (SPA)
- É um Single Page Application. Nenhum clique interno pode recarregar a página nem abrir aba nova.
- Navegação interna SEMPRE via <Link> ou useNavigate do react-router-dom.
- PROIBIDO <a href> para rotas internas. PROIBIDO target="_blank" para rotas internas.
- EXCEÇÃO: links externos (WhatsApp, Instagram, e-mail, telefone) PODEM abrir em nova aba com target="_blank" rel="noopener noreferrer".

## Identidade visual (Casanossa)
- Cor primária: azul royal #22337a. Conferir com public/logo.png e ajustar se necessário (é azul marinho/royal, não pode puxar pro teal).
- Títulos de seção em azul royal, com letter-spacing leve (o site original espaça as letras dos títulos).
- Blocos de "localização" e "preço" com fundo azul-claro (marca.claro / marca.suave).
- Botão de WhatsApp sempre verde (#25D366) com ícone.
- Rodapé em azul escuro (marca.escuro) com os dados da ficha da marca.
- Estilo geral: limpo, profissional, moderno; cards com sombra suave e cantos arredondados; bastante espaço em branco.
- Mobile-first e 100% responsivo. Testar em 375px, 768px e 1280px.

## Qualidade de código
- Componentes pequenos e reutilizáveis, um por arquivo, em src/components/.
- Páginas em src/pages/. Queries de dados em src/services/.
- Chaves do Supabase em variáveis de ambiente (.env), nunca no código.
- Sempre tratar loading e erro nas telas que buscam dados.

## Verificação
- Ao terminar cada tarefa, subir o localhost e testar no navegador com o agente de browser.
- Verificar sempre: navegação sem reload, responsividade mobile e validação de formulários.