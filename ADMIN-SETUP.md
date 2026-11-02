# ELP3D — Configurar o painel administrativo com segurança

O catálogo público funciona no GitHub Pages mesmo sem Firebase. O painel **/admin.html** fica fora do menu; porém o que protege os dados de verdade não é esconder a URL, e sim Firebase Authentication + as regras do Firestore/Storage.

## 1. Criar seu projeto Firebase
1. No Firebase Console, crie um projeto e registre um aplicativo Web.
2. Em **Authentication → Sign-in method**, habilite **E-mail/senha**.
3. Em **Authentication → Users**, crie sua conta administrativa com uma senha forte e exclusiva.
4. Abra a conta criada e copie o **UID** do usuário (não a senha).
5. Crie um **Cloud Firestore** em modo produção e um bucket no **Cloud Storage**. A disponibilidade/ cobrança do Storage depende do plano Firebase.
6. No arquivo `firebase-config.js`, substitua `null` pelo objeto público `firebaseConfig` do projeto (com `apiKey, authDomain, projectId, storageBucket, appId`, etc.) e defina `window.ELP3D_ADMIN_UID = 'SEU_UID';`. A chave da aplicação Web **não é uma senha**. Nunca publique uma credencial de serviço ou senha.
7. Edite `firestore.rules` e `storage.rules`, substituindo `ADMIN_UID_SUBSTITUA_AQUI` pelo mesmo UID. Copie e **publique** as respectivas regras em Firestore → Rules e Storage → Rules. Sem essas regras o painel não terá permissão — não altere para `allow write: if true`.
8. Salve as alterações no repositório (branch `main`) e abra **/admin.html** para fazer login. Não compartilhe sua senha.

## 2. Importar e gerenciar produtos
Entre em **Produtos → Importar os 9 produtos atuais**. Isso cria os registros sem sobrescrever os que já estão cadastrados. Depois, use **Novo produto** ou **Editar**: nome, preço, descrição, categoria, ordem, foto e visibilidade. As fotos novas são armazenadas no Firebase Storage; as imagens antigas continuam no repositório. O catálogo público se atualiza quando o Firestore recebe as alterações. Os produtos padrão continuam visíveis enquanto o banco não estiver configurado ou sem itens.

## 3. Faturamento por mês
Após confirmar um pedido pelo WhatsApp ou uma venda presencial, abra **Vendas** e registre data, valor recebido e custo opcional. A **Visão geral** mostra faturamento e estimativa de lucro dos seis meses recentes. A estimativa desconsidera custos que não foram registrados. **O site não acompanha conversas do WhatsApp nem confirma pagamentos automaticamente.** O registro é manual para evitar contar orçamentos como vendas.

## 4. Cuidados
- Nunca guarde senhas em HTML, JavaScript ou no repositório.
- Uma rota “oculta” não é autenticação; a autenticação é feita pelo Firebase.
- Firestore público tem somente leitura de produtos; vendas exigem o UID administrador.
- Antes de divulgar o site, atualize as fotos de `assets/` com as versões completas do pacote ELP3D-fotos-alta-qualidade.zip, preservando os nomes; a resolução reduzida não volta por CSS.
- A publicação do GitHub Pages é feita pela branch `main`, pasta `/(root)`.
