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

## Licença

Este projeto é distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
