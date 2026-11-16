# Website BUKU Autores

Site estático (HTML, CSS e JavaScript, sem dependências), pronto para ser alojado no **Netlify**, que trata dos formulários e do painel administrativo.

## Ver localmente
Abra o `index.html` com um duplo clique. Sem servidor, os conteúdos vêm de `assets/js/content-data.js`, uma cópia de `content/*.json`. Se editar os JSON à mão, actualize também essa cópia. Online, através do painel `/admin`, não é preciso.

Os formulários só enviam dados quando o site está publicado no Netlify. Aberto localmente, o formulário de proposta propõe o envio pelo WhatsApp.

## Antes de publicar: o que tem de preencher
Edite `content/definicoes.json` (ou use o painel em `/admin`):
- `whatsapp`: número real no formato `2588XXXXXXXX`; neste momento está um número fictício.
- `telefone`, `email`, `morada`, links das redes sociais.
- `ga4_id` (Google Analytics 4) e `meta_pixel_id`: só são carregados se o visitante aceitar os cookies.
- Substitua `https://buku.co.mz` pelo domínio real nas tags `canonical`/`og`, em `sitemap.xml` e em `robots.txt`.

## Publicar no Netlify
1. Coloque esta pasta num repositório GitHub e ligue-o ao Netlify (não precisa de comando de build).
2. **Formulários:** são detectados automaticamente (proposta, guia, newsletter) e chegam em *Forms*, já com os parâmetros UTM e a página de origem. Configure lá as notificações por email.
3. **Painel administrativo (`/admin`):** active *Identity* e *Git Gateway* no Netlify e convide os utilizadores. No painel pode gerir obras, artigos, testemunhos e definições.

## Portfólio e testemunhos
- Para não inventar obras, o portfólio mostra o **Programa Autores Fundadores** até existirem obras reais.
- `obra.html?id=modelo-ficha-de-obra` e `portfolio.html?modelo=1` mostram uma ficha-modelo, oculta ao público. Apague-a quando houver obras reais.
- Os testemunhos só aparecem quando estão marcados como **autorizados**.

## Campanhas (UTM)
Landing pages: `lp/medicos.html`, `lp/professores.html`, `lp/lideres-religiosos.html`, `lp/biografias.html` e `lp/producao-de-livros.html`.
Exemplo de link para um anúncio:
`https://buku.co.mz/lp/medicos.html?utm_source=instagram&utm_medium=paid&utm_campaign=medicos-nov`
A origem fica guardada durante a visita e é enviada com qualquer formulário. Também é acrescentada à mensagem do WhatsApp.

## Rever
- O texto de `privacidade.html` é uma base e deve ser validado juridicamente.
- As fotografias vêm da pasta BUKUS. Confirme que tem direitos de uso comercial sobre cada uma.
