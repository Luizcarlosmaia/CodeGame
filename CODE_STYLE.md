# Padrão de Código – Projeto Código Secreto

## 1. Estilização

- Utilize **Tailwind CSS** para estilização de componentes React.
- Tokens e classes reutilizáveis ficam em `src/index.css` (`@theme`, `@layer components`).
- Use o helper `cn()` em `src/lib/cn.ts` para classes condicionais.
- Evite CSS inline; prefira utilitários Tailwind ou classes de componente compartilhadas.
- `index.css` concentra estilos globais e animações.

## 2. Organização de Componentes

- Cada componente deve estar em seu próprio arquivo dentro da pasta `components/` ou subpastas.
- Componentes devem ser nomeados em PascalCase (ex: `MeuComponente.tsx`).
- Componentes relacionados devem ficar em subpastas.
- Testes de componentes devem ficar no mesmo nível do componente, com o sufixo `.test.tsx`.
- Páginas ficam em `pages/`; estilos usam Tailwind no próprio componente.

## 3. Boas Práticas Gerais

- Prefira funções puras e componentes funcionais.
- Utilize hooks para lógica de estado e efeitos colaterais.
- Evite lógica de negócio dentro dos componentes de apresentação.
- Use nomes claros e descritivos para arquivos, funções e variáveis.

## 4. Exemplo de Estrutura

```
components/
  MeuComponente/
    MeuComponente.tsx
    MeuComponente.test.tsx

pages/
  CustomRoomCreatePage.tsx
```

## 5. Outras Regras

- Sempre escreva comentários claros quando necessário.
- Siga as regras do ESLint configuradas no projeto.
- Mantenha o código limpo e organizado.

---

Siga este guia para garantir a padronização e facilitar a manutenção do projeto.
