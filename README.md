# SmartFlux

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

O **SmartFlux** é um Sistema de Gestão Financeira simples, ágil e responsivo, desenvolvido especificamente para micro e pequenos empreendedores (MEIs, autônomos e pequenos comércios). 

Nosso objetivo é transformar a desorganização financeira, frequentemente baseada em cadernos de papel, planilhas confusas ou apenas no saldo bancário, em um controle claro, eficiente e na palma da mão, separando definitivamente as finanças pessoais das empresariais.

---

## O Problema
Muitos pequenos empreendedores sofrem com:
- Falta de visão clara do fluxo de caixa.
- Dificuldade para prever problemas financeiros.
- Mistura perigosa entre finanças pessoais e empresariais.
- Uso de ferramentas genéricas ou complexas demais para a rotina ágil do negócio.
- Ausência de indicadores para apoiar a tomada de decisão.

## A Solução
O SmartFlux foi pensado para ter a **menor fricção possível**. Sabemos que o empreendedor não tem tempo a perder, por isso o sistema adota as seguintes diretrizes de design:
- **Mobile First:** A interface é pensada primariamente para uso no celular, acompanhando o empreendedor onde ele estiver.
- **Baixa Fricção:** Inserção de receitas e despesas de forma rápida.
- **Categorização Opcional:** O sistema sugere e permite criar categorias (ex: combustível, papelaria), mas a categorização não é obrigatória, evitando que o usuário trave no lançamento básico de dados.

---

## Funcionalidades

### Início
- **Autenticação e Segurança:** Controle de usuários com persistência segura de dados.
- **Lançamentos Ágeis:** Registro manual rápido de receitas e despesas.
- **Gestão de Vencimentos:** Controle de contas a pagar e a receber com alertas de data.
- **Relatórios Gerenciais:** 
  - Visão de fluxo de caixa.
  - Análise de receitas e despesas por categorias.
  - Exportação de dados para `.CSV`.

### Funcionalidades Futuras
- **Dashboard Visual:** Painel interativo com gráficos de desempenho financeiro.
- **Importação Semi-Automática:** Leitura de extratos bancários para alimentar o sistema sem digitação manual.
- **Previsão de Saldo com IA:** Integração com um modelo de Inteligência Artificial (LLM) local para analisar o histórico e realizar previsões de cenários e saldos futuros.

---

## Arquitetura e Tecnologias

O projeto adota uma **Arquitetura de Microsserviços**, garantindo escalabilidade e facilidade de manutenção. Toda a infraestrutura é conteinerizada utilizando **Docker**.

A separação básica de contêineres inclui:
1. **Banco de Dados** (Isolado e persistente).
2. **Backend / API** (Regras de negócio e processamento).
3. **Frontend / UI** (Interface responsiva).
4. **Serviço de IA** *(Futuro)* (Contêiner dedicado rodando uma LLM local para previsões financeiras).

---

## Como Executar (Docker)

O projeto está totalmente conteinerizado sob um único arquivo `docker-compose.yml` que sobe todo o ecossistema necessário:

1. Certifique-se de que possui o **Docker** e o **Docker Compose** instalados na sua máquina.
2. Abra o terminal na raiz do projeto (onde está o arquivo `docker-compose.yml`).
3. Execute o comando abaixo para realizar o *build* limpo e subir os serviços em segundo plano:
   ```bash
   docker-compose up -d --build
   ```

Aguarde o download e a compilação (pode levar alguns minutos na primeira execução). Assim que o processo concluir, o sistema estará acessível nas seguintes portas:

- **Frontend (Interface Web):** [http://localhost:3000](http://localhost:3000)
- **Backend (API Spring Boot):** [http://localhost:8080](http://localhost:8080)
- **Banco de Dados (PostgreSQL):** Porta `5432`

Para verificar os avisos da aplicação em tempo real, use:
```bash
docker-compose logs -f
```

Para interromper de forma segura todos os containers:
```bash
docker-compose down
```

---

## Licença

Este projeto é distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
