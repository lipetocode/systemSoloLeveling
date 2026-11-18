# SYSTEM v0.4.1 — pacote estático para GitHub Pages

## Publicação
1. Extraia o ZIP. Abra a pasta `SYSTEM`.
2. Envie **o conteúdo da pasta SYSTEM**, incluindo `index.html`, `css/` e `js/`, para a raiz de seu repositório GitHub (não envie apenas o ZIP).
3. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` e salve.
4. Abra o endereço HTTPS fornecido pelo GitHub Pages. Pode levar alguns minutos.

## Execução local e dados
Abra `index.html` com duplo clique, sem servidor. Esta edição não faz requisições de CSS, JS ou fontes a CDNs; os ícones são substituições locais em caracteres Unicode (não são os glifos oficiais do Google Material Icons). A aparência pode diferir ligeiramente da v0.4. A camada local fornece os recursos de layout, modal, seleção e mensagens usados pelo SYSTEM, sem distribuir o Materialize original.

**Antes de mudar de ambiente**, abra a versão antiga na mesma localização em que seus dados estão salvos e clique em **EXPORTAR BACKUP**. Depois de publicar, use **IMPORTAR BACKUP** na versão HTTPS. `file://` e `https://` não compartilham localStorage. Faça cópia do backup e só descarte os dados antigos após conferir os valores restaurados. O armazenamento `file://` varia por navegador/caminho.

## Verificação manual necessária
- Abrir `index.html` offline e confirmar interface, ícones, modal de edição e missões.
- Concluir missão, atualizar página e confirmar XP e atributos.
- Exportar backup, importar em outra origem e comparar dados.
- Conferir no celular e na URL do GitHub Pages.

## Testes automatizados
`npm test` com Node.js 22 ou compatível. Os testes cobrem regras de negócio, **não** a renderização do navegador. Nenhum build nem dependência npm é necessário para hospedar.

## Estrutura
- `index.html`: página principal
- `css/style.css`: aparência clássica do SYSTEM
- `css/local-ui.css`: compatibilidade visual local
- `js/system-classic.js`: aplicação executável em `file://`
- `js/local-ui.js`: modal, notificações e controles locais
- `js/modules/`, `js/app.js`, `tests/`: fontes modulares e testes, não carregados pela página principal
