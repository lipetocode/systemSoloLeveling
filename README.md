# SYSTEM v0.5.1 — CSS Hotfix

Aplicativo de acompanhamento de treinos inspirado na progressão RPG de Solo Leveling. HTML, CSS e JavaScript, com camada local compatível com os componentes Materialize utilizados. Prazo previsto para a versão 1.0: 31/12/2026.

## Novidades da v0.5.1 (24/11/2026)
- Correção visual do registro de treinos: campos escuros, labels acima dos campos, espaçamento, botões e lista de registros padronizados.
- Layout responsivo em cinco, duas ou uma coluna, conforme a largura da tela.
- Versionamento da URL de `css/style.css` para reduzir problemas de cache.
- Sem alteração na lógica JavaScript ou nas chaves de armazenamento da v0.5.0.

## Publicação no GitHub Pages
1. Exporte os backups do jogador e dos treinos antes de atualizar.
2. Extraia o ZIP e abra a pasta `SYSTEM`.
3. Envie o conteúdo dessa pasta para a raiz do repositório, substituindo os arquivos correspondentes e preservando `css/` e `js/`.
4. Faça o commit `Release v0.5.1 - CSS Hotfix`.
5. Em Settings → Pages, confirme a branch de publicação (normalmente `main`) e a pasta `/ (root)`.
6. Aguarde o deploy e abra https://lipetocode.github.io/systemSoloLeveling/ . Confira a versão no cabeçalho e rodapé. Se necessário, recarregue sem cache.

## Execução local e armazenamento
Abra `index.html` diretamente no navegador. Não é necessário instalar dependências para executar ou hospedar. A camada visual local não distribui o Materialize original; os ícones são substituições Unicode. Não há dependências de CDN.

Os dados ficam no localStorage do navegador. `file://` e `https://` não compartilham armazenamento. Exporte **EXPORTAR BACKUP** (jogador) e **EXPORTAR TREINOS** (registros) separadamente antes de mudar de origem, navegador ou caminho local. Importe cada arquivo pelo controle correspondente; a importação de treinos substitui os registros atuais após confirmação. Confira os dados antes de descartar os backups.

## Registro de treinos
Cadastre data, exercício, séries, repetições, carga e observações. É possível editar, excluir e exportar/importar registros. O cadastro não concede XP automaticamente. Sessões com múltiplos exercícios e cargas individualizadas por série ainda não fazem parte desta versão.

## Testes e homologação
Execute `npm test` com Node.js 22 ou compatível. Os testes de negócio não substituem a validação visual. Confira cadastro, edição, exclusão, persistência, backup, XP e layout em desktop e celular. A publicação remota deve ser homologada após o deploy.

## Estrutura
- `index.html`: página principal.
- `css/style.css`: interface clássica e hotfix de treinos.
- `css/local-ui.css`: componentes visuais locais.
- `js/system-classic.js`: jogador, XP e missões.
- `js/workouts.js`: registro de treinos e backup próprio.
- `js/local-ui.js`: controles locais.
- `js/modules/`, `js/app.js`, `tests/`: fontes modulares e testes; não carregados pela página principal.
