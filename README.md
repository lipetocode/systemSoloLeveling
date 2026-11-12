# SYSTEM v0.2 — Player Core

Aplicativo web responsivo com HTML5, Materialize CSS e JavaScript ES modules.

## Executar

**Não abra o HTML via `file://`:** módulos ES exigem servidor HTTP.

Na pasta `SYSTEM`, execute `python -m http.server 8000` e abra http://localhost:8000.
É necessária internet para carregar Materialize e Google Material Icons via CDN.

## Testes

Node.js 18+: `npm test` (não exige `npm install`).

## Arquitetura

- `index.html` — interface e modal do perfil
- `css/style.css` — tema responsivo
- `js/app.js` — eventos e atualização da interface
- `js/modules/player.js` — perfil e dados de exibição
- `js/modules/xp.js` — progressão de XP e atributos
- `js/modules/missions.js` — missões e recompensas
- `js/modules/storage.js` — persistência local
- `tests/core.test.mjs` — testes automatizados do núcleo

## Compatibilidade

Mantida a chave de armazenamento `system-player-v1`, migrando automaticamente a exibição da progressão linear de 100 XP para a curva incremental `round(100 * nível^1.5)`. O XP total já adquirido é preservado, mas o nível exibido pode mudar. A desmarcação de uma missão do dia reverte seu XP. Dados continuam locais ao navegador.

## Pendências

Validação visual manual em dispositivos e navegadores, exportação/backup de dados, histórico de treinos e testes de integração da interface.

## Build 0.2.1 — Classic Interface
- HTML visual restaurado a partir da Build 0.1 (somente o carregamento modular e o número da versão foram atualizados).
- CSS exatamente igual ao da Build 0.1.
- Lógica modular e testes da Build 0.2 preservados.
- Executar com servidor HTTP local, por exemplo `python -m http.server 8000`.
- Testes: `npm test`.
