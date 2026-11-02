# ELP3D — Ativar o painel com Firebase gratuito (Spark)

O painel está em **/admin.html**. O GitHub Pages hospeda o site, as fotos continuam no próprio GitHub e o Firebase **Authentication + Cloud Firestore** fornece login e dados. **Firebase Storage NÃO é necessário**; não faça upgrade para Blaze só por causa das imagens.

## 1. Authentication (login de administrador)
1. No console do projeto Firebase, abra **Build → Authentication → Começar**.
2. Em **Sign-in method**, habilite **E-mail/senha**.
3. Na aba **Users / Usuários**, adicione um usuário administrador com o seu e-mail e uma senha forte e exclusiva.
4. Copie o **UID** dessa conta. **Nunca envie a senha nem a coloque em arquivos do GitHub.**
5. Em **Authentication → Settings → Authorized domains**, confira se `elp28.github.io` está na lista. Adicione se necessário.

## 2. Firestore (banco de dados)
Se você já criou o banco, esta etapa está concluída.
1. Em **Firestore Database → Rules**, substitua as regras atuais pelo conteúdo do arquivo `firestore.rules` deste repositório.
2. Antes de publicar, substitua `ADMIN_UID_SUBSTITUA_AQUI` pelo UID de sua conta do Authentication.
3. Clique **Publish**. As regras permitem leitura pública do catálogo; apenas o usuário autenticado com aquele UID pode editar produtos e acessar vendas. **Não use `allow write: if true`**.

## 3. Conectar o site ao seu Firebase
1. Em **Project settings (ícone de engrenagem) → General**, registre um app Web (`</>`) se ainda não houver um.
2. Copie **somente** o objeto público de configuração `firebaseConfig` (contendo `apiKey, authDomain, projectId, appId`, etc.). A `apiKey` web não é a senha de sua conta; as regras de segurança protegem os dados.
3. No repositório, edite `firebase-config.js` na branch `main`:
   - Substitua `window.ELP3D_FIREBASE_CONFIG = null;` por `window.ELP3D_FIREBASE_CONFIG = { ...configuração do app Web... };`
   - Preencha `window.ELP3D_ADMIN_UID = '...';` com o mesmo UID do Authentication e das regras.
4. Salve (**Commit changes**) e abra `https://elp28.github.io/elp3D_geral/admin.html` depois que o GitHub Pages atualizar.

**Nunca compartilhe senha, credenciais de serviço, arquivos JSON de conta de serviço ou tokens de acesso.** O objeto de configuração pública do app Web não substitui a autenticação.

## 4. Gerenciar catálogo e fotos sem Storage
- Entre em **Produtos → Importar os 9 produtos atuais** na primeira vez.
- Edite nome, preço, categoria, descrição, ordem e visibilidade no painel.
- Para **uma nova foto**, envie um arquivo `.webp` ou `.png` à pasta raiz `assets/` do repositório GitHub (não à subpasta `assets/assets/`).
- No editor do produto, no campo **Imagem do produto**, informe `assets/nome-da-foto.webp`, exatamente como o arquivo foi salvo; também aceita link HTTPS público.
- A imagem não é enviada diretamente pelo painel, pois Firebase Storage requer plano Blaze. Todos os demais campos do catálogo são editáveis normalmente.
- A vitrine pública sincroniza as alterações com Firestore.

## 5. Faturamento e lucro mensal
Registre cada venda **depois de confirmada**, seja pelo WhatsApp ou presencialmente: data, valor recebido e custo opcional. Em **Visão geral**, veja receita mensal, custos informados e lucro estimado. O site não confirma automaticamente mensagens do WhatsApp, pagamentos ou pedidos; isso evita contabilizar orçamento como receita.

## 6. Segurança e custos
- Continue no **Spark** e acompanhe os limites gratuitos de Authentication e Firestore; não é necessário vincular cartão para usar essas funções dentro das cotas.
- A URL do painel não aparece no menu, mas não é secreta: a segurança depende do login e das regras do Firestore.
- Produtos são de leitura pública, dados de vendas somente do administrador.
- Evite fornecer dados pessoais de clientes em registros do Firestore desnecessariamente.
- A publicação do site usa a branch `main`, pasta `/(root)`.
