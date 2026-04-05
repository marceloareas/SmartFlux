# SmartFlux API

Esta é a API do back-end do projeto **SmartFlux**, construída utilizando **Spring Boot** (Java). Ela é responsável por tratar as regras de negócio, expor os endpoints e se comunicar com o banco de dados.

## 🚀 Tecnologias e Requisitos

- **Java**
- **Spring Boot**
- **Docker** e **Docker Compose**

---

## 🐳 Comandos Importantes (Docker)

A infraestrutura local, principalmente o banco de dados PostgreSQL, está configurada utilizando o Docker. Abaixo estão os comandos mais usados no dia a dia do desenvolvimento.

> **Aviso:** Execute os comandos abaixo dentro do diretório onde o arquivo `docker-compose.yml` está localizado (na raiz de `api` ou do projeto, dependendo de como está organizado).

### Subir os serviços (Start)

Inicia os containers (ex: banco de dados) e deixa rodando em segundo plano (`-d` de detached).

```bash
docker-compose up -d
```

### Subir e "Buildar" novamente

Inicia os serviços e força a recriação das imagens. Muito útil caso você tenha modificado algum `Dockerfile` ou configurações de dependência no compose.

```bash
docker-compose up -d --build
```

### Parar os serviços

Apenas para os containers, sem remover redes ou dados de configuração.

```bash
docker-compose stop
```

### Derrubar os serviços (Down)

Para e **remove** os containers e as redes criadas para o serviço.

```bash
docker-compose down
```

> **Atenção:** Se quiser excluir também os bancos de dados criados (volumes persistentes), utilize a flag `-v`. Isso apagará todas as tabelas e dados do banco local!
>
> ```bash
> docker-compose down -v
> ```

### Visualizar Logs

Acompanha em tempo real os logs dos containers rodando no Docker.

```bash
docker-compose logs -f
```

---

## 🏃 Como rodar a aplicação localmente

1. Certifique-se de que o **Docker está aberto e os serviços rodando** através do comando `docker-compose up -d`.
2. Rode o comando de start do projeto diretamente por sua IDE de preferência ou através do terminal (na raiz da pasta `api`):

Se o projeto utilizar **Maven**:

```bash
./mvnw clean spring-boot:run
```

Isso fará com que o Spring Boot inicie a aplicação localmente e se conecte ao banco de dados do Docker.

---

## 📖 Documentação da API (Swagger)

A aplicação conta com documentação interativa dos endpoints configurada via **Swagger (OpenAPI)**. 

Com a API rodando, você pode visualizar as rotas, os formatos esperados de requisição e testar tudo diretamente pelo navegador acessando o link abaixo:

👉 **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

---

### 💡 Guia Rápido de Comandos (Maven)

| Situação                                 | Comando / Ação Recomendada               |
| :--------------------------------------- | :--------------------------------------- |
| **Criou uma classe simples**             | Apenas o botão de Play do VS Code/IDE |
| **Adicionou dependência no `pom.xml`**   | `./mvnw spring-boot:run`                 |
| **Renomeou ou deletou classes/pastas**   | `./mvnw clean spring-boot:run`           |
| **Aplicação com comportamento estranho** | `./mvnw clean spring-boot:run`           |

---
