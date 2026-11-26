# SYSTEM v0.5.2 — Workout Sessions

Aplicativo de acompanhamento de treinos inspirado na progressão RPG de Solo Leveling. HTML, CSS e JavaScript, com camada local compatível com os componentes Materialize utilizados. Prazo previsto para a versão 1.0: 31/12/2026.

## Novidades da v0.5.2 (26/11/2026)
- Sessões com múltiplos exercícios, grupo muscular, observações e séries individuais.
- Classificação preparatória, efetiva ou não classificada; volume total e efetivo calculados por carga × repetições. Informe a carga total utilizada (para halteres, some os dois quando usados simultaneamente).
- Migração automática dos registros v1 para sessões individuais, sem apagar a chave antiga. Séries antigas ficam não classificadas; não é possível inferir sua intensidade. O volume mantém a convenção de carga original.
- Backup de treinos v2, com leitura de backups v1 e v2. A importação substitui as sessões atuais após confirmação. Não há sincronização retroativa com versões antigas.
- Nenhuma alteração na lógica de jogador, XP ou missões.

## Publicação no GitHub Pages
1. Exporte os backups do jogador e dos treinos antes de atualizar.
2. Extraia o ZIP e abra a pasta `SYSTEM`.
3. Envie o conteúdo dessa pasta para a raiz do repositório, substituindo os arquivos correspondentes e preservando `css/` e `js/`.
4. Faça o commit `Release v0.5.2 - Workout Sessions`.
5. Em Settings → Pages, confirme a branch de publicação (normalmente `main`) e a pasta `/ (root)`.
6. Aguarde o deploy e abra https://lipetocode.github.io/systemSoloLeveling/ . Confira a versão no cabeçalho e rodapé. Se necessário, recarregue sem cache.

## Execução local e armazenamento
Abra `index.html` diretamente no navegador. Não é necessário instalar dependências para executar ou hospedar. A camada visual local não distribui o Materialize original; os ícones são substituições Unicode. Não há dependências de CDN.

Os dados ficam no localStorage do navegador. `file://` e `https://` não compartilham armazenamento. Exporte **EXPORTAR BACKUP** (jogador) e **EXPORTAR TREINOS** (registros) separadamente antes de mudar de origem, navegador ou caminho local. Importe cada arquivo pelo controle correspondente; a importação de treinos substitui os registros atuais após confirmação. Confira os dados antes de descartar os backups.

## Registro de treinos
Informe data e nome da sessão, adicione exercícios e séries, selecione o grupo muscular e o tipo de cada série. Salve a sessão para persistir os dados. É possível editar, excluir e exportar/importar sessões. Limites: 300 sessões, 30 exercícios por sessão, 30 séries por exercício. A sessão não concede XP automaticamente. O volume é um indicador de carga externa, não uma medida direta de hipertrofia. Rascunhos não salvos não persistem após recarregar.

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
