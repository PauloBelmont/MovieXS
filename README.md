# MovieXS - Sistema de recomendação de filmes

Este projeto foi desenvolvido como parte dos requisitos para a obtenção parcial de notas na disciplina Arquitetura e Tecnologias de Sistemas Web.

## Instalação

1 - Clone o repositório
   ```bash
   git clone https://github.com/Paulo-player/DCC704_ProjetoFinal.git
   ```
2 - Navegue até a pasta do projeto
   ```bash
      cd DCC704_ProjetoFinal
   ```
3 - Renomeie o arquivo .env.example na pasta raiz e preencha as variáveis de ambiente conforme indicado no arquivo
   ```bash
      rename .env.example .env
      notepad .env
   ```
4 - Feche o notepad e inicie um segundo terminal
   ```bash
      start cmd
   ```
5 - No primeiro terminal, navegue até a pasta do backend e instale as dependências
   ```bash
      cd backend
      yarn install
   ```
6 - No segundo terminal, navegue até a pasta do frontend e instale as dependências
   ```bash
      cd frontend
      yarn install
   ```
7 - Ao acabar a instalação no primeiro terminal, execute o backend
```bash
      yarn start
   ```
8 - Ao acabar a instalação no segundo terminal, execute o frontend
```bash
      yarn dev
   ```