# Padrão de Código – Projeto Código Secreto

## 1. Estilização

- Sempre utilize **styled-components** para estilização de componentes React.
- Crie um arquivo separado para os styled components, com o sufixo `.styles.ts`.
  - Exemplo: para `Botao.tsx`, crie `Botao.styles.ts`.
- Nunca escreva CSS inline ou use o atributo `style` diretamente nos componentes.
- Não utilize outros métodos de estilização (ex: CSS Modules, arquivos `.css`), exceto para arquivos globais (ex: `index.css`).

## 2. Organização de Componentes

- Cada componente deve estar em seu próprio arquivo dentro da pasta `components/` ou subpastas.
- Componentes devem ser nomeados em PascalCase (ex: `MeuComponente.tsx`).
- Os arquivos de styled devem importar apenas o necessário para estilização.
- Exporte apenas os styled components necessários.

## 3. Estrutura de Pastas

- Componentes relacionados devem ficar em subpastas.
- Testes de componentes devem ficar no mesmo nível do componente, com o sufixo `.test.tsx`.
- **Páginas e seus arquivos de styled devem ser organizados em subpastas próprias dentro de `pages/`**.
  - Exemplo: para a página `CustomRoomCreatePage`, crie uma pasta `CustomRoomCreatePage/` contendo `CustomRoomCreatePage.tsx` e `CustomRoomCreatePage.styles.ts`.
  - Isso isola melhor a lógica, estilos e testes de cada página.

## 4. Boas Práticas Gerais

- Prefira funções puras e componentes funcionais.
- Utilize hooks para lógica de estado e efeitos colaterais.
- Evite lógica de negócio dentro dos componentes de apresentação.
- Use nomes claros e descritivos para arquivos, funções e variáveis.

## 5. Exemplo de Estrutura

```
components/
  MeuComponente/
    MeuComponente.tsx
    MeuComponente.styles.ts
    MeuComponente.test.tsx

pages/
  CustomRoomCreatePage/
    CustomRoomCreatePage.tsx
    CustomRoomCreatePage.styles.ts
    CustomRoomCreatePage.test.tsx
```

## 6. Outras Regras

- Sempre escreva comentários claros quando necessário.
- Siga as regras do ESLint configuradas no projeto.
- Mantenha o código limpo e organizado.

---

Siga este guia para garantir a padronização e facilitar a manutenção do projeto.
