## Objetivo do Teste

O objetivo deste teste é avaliar a sua habilidade de integrar várias tecnologias e criar uma aplicação funcional que utilize NestJS como framework principal. A aplicação deve incluir as seguintes funcionalidades e tecnologias:

1. **NestJS**: Framework principal para a aplicação.
2. **PostgreSQL**: Banco de dados relacional para armazenar dados persistentes.
3. **Kafka**: Sistema de mensagens distribuído para processamento de dados em tempo real.
4. **Swagger**: Documentação de API para facilitar o entendimento e a interação com as APIs da aplicação.
5. **Redis**: Armazenamento em cache e gerenciamento de sessões.
6. **Docker & Docker Compose**: Para configuração e orquestração do ambiente de desenvolvimento.

## Requisitos do Teste

1. **Configuração do Ambiente**: Configure o ambiente de desenvolvimento utilizando Docker e Docker Compose para facilitar a replicação e a execução da aplicação.

2. **Módulo de Usuários**:
    - Crie um módulo de usuários que permita a criação, leitura, atualização e exclusão (CRUD) de usuários.
    - Armazene os dados dos usuários no PostgreSQL.
    - Use entidades e DTOs para estruturar os dados de forma correta.

3. **Integração com Kafka**:
    - Configure um consumidor e um produtor Kafka.
    - Envie eventos para Kafka quando um usuário for criado ou atualizado.
    - Processe eventos Kafka para executar ações na aplicação (por exemplo, logging, auditoria).

4. **Documentação com Swagger**:
    - Adicione documentação Swagger à aplicação.
    - Certifique-se de que todas as rotas da API estejam documentadas e possam ser testadas via Swagger UI.

5. **Cache com Redis**:
    - Utilize Redis para armazenar em cache dados frequentemente acessados.
    - Implemente uma estratégia de cache para otimizar a performance da aplicação (por exemplo, cache de resultados de consultas).

## Critérios de Avaliação

1. **Configuração e Estrutura do Projeto**: A estrutura do projeto deve ser clara e organizada. O uso de Docker e Docker Compose para configuração do ambiente de desenvolvimento é um ponto positivo.
2. **Funcionalidade**: Todas as funcionalidades especificadas devem estar implementadas e funcionando corretamente.
3. **Integração de Tecnologias**: A integração entre NestJS, PostgreSQL, Kafka, Swagger e Redis deve ser bem feita e eficiente.
4. **Código Limpo e Bem Documentado**: O código deve ser limpo, bem comentado e seguir boas práticas de desenvolvimento.
5. **Documentação de API**: A documentação Swagger deve estar completa e facilitar a interação com a API.

## Passos para Realizar o Teste

1. **Configurar o Ambiente**:
    - Utilize Docker e Docker Compose para configurar e iniciar o PostgreSQL, Kafka e Redis.
    - Configure as variáveis de ambiente necessárias (por exemplo, credenciais de banco de dados, configuração de Kafka).

2. **Implementar o Módulo de Usuários**:
    - Crie o módulo, controlador, serviço, entidades e DTOs necessários.
    - Implemente as operações CRUD para usuários.

3. **Configurar Kafka**:
    - Crie um consumidor e um produtor Kafka.
    - Implemente a lógica para enviar e processar eventos Kafka.

4. **Adicionar Swagger**:
    - Configure Swagger na aplicação.
    - Documente todas as rotas da API.

5. **Implementar Cache com Redis**:
    - Configure Redis na aplicação.
    - Implemente a lógica de cache para otimizar a performance.

## Deploy da Aplicação

1. **Deploy em um Serviço de Hospedagem**:
    - Faça o deploy da aplicação em um serviço de hospedagem de sua escolha (Heroku, AWS, DigitalOcean, etc.).
    - Garanta que a aplicação esteja acessível publicamente.

2. **Incluir Instruções de Deploy**:
    - Adicione ao repositório um arquivo `DEPLOY.md` com instruções detalhadas de como fazer o deploy da aplicação.

## Conclusão

Este teste técnico é projetado para avaliar suas habilidades em integrar diferentes tecnologias e criar uma API RESTful funcional e bem documentada usando NestJS. Ao seguir os requisitos e critérios de avaliação, você poderá demonstrar sua capacidade de trabalhar com sistemas complexos e tecnologias de ponta.

**Após concluir o teste, entre em contato com o recrutador e envie os links do repositório e do deploy da aplicação.**

