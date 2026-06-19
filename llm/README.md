# API de Previsão de Saldo

Serviço desenvolvido com FastAPI que:

1. Recebe dados históricos mensais de crédito
2. Utiliza um modelo pré-treinado de previsão com PyTorch
3. Gera previsões zero-shot para os próximos meses utilizando Amazon Chronos

---

# Requisitos

* Python 3.10+
* pip

---

# Instalação

Instale as dependências:

```bash id="2w7c2v"
pip install -r requirements.txt
```

---

# Executando a API

Inicie o servidor FastAPI:

```bash id="d24mq9"
uvicorn app:app --reload
```

A API ficará disponível em:

```text id="2kqk4z"
http://localhost:8000
```

Documentação interativa Swagger:

```text id="gub0to"
http://localhost:8000/docs
```

---

# Endpoint da API

## POST `/predict`

Gera previsões para valores futuros de crédito mensal.

### Corpo da Requisição

```json id="j2snx9"
{
  "horizon": 6,
  "series": [
    {"month": "2026-01", "value": 1200},
    {"month": "2026-02", "value": 1300},
    {"month": "2026-03", "value": 1280},
    {"month": "2026-04", "value": 1400}
  ]
}
```

### Parâmetros

| Campo     | Tipo    | Descrição                                 |
| --------- | ------- | ----------------------------------------- |
| `horizon` | inteiro | Quantidade de meses futuros para previsão |
| `series`  | array   | Histórico mensal dos dados de crédito     |
| `month`   | string  | Mês no formato `YYYY-MM`                  |
| `value`   | float   | Valor de crédito referente ao mês         |

---

# Exemplo de Requisição com cURL

```bash id="t5g48w"
curl -X POST "http://localhost:8000/predict" \
-H "Content-Type: application/json" \
-d '{
  "horizon": 6,
  "series": [
    {"month": "2026-01", "value": 1200},
    {"month": "2026-02", "value": 1300},
    {"month": "2026-03", "value": 1280},
    {"month": "2026-04", "value": 1400}
  ]
}'
```

---

# Exemplo de Resposta

```json id="t3fjmr"
{
  "input_points": 4,
  "forecast_horizon": 6,
  "predictions": [
    {
      "month": "05/2026",
      "predicted_credit": 1450.21
    },
    {
      "month": "06/2026",
      "predicted_credit": 1468.37
    }
  ]
}
```

---

# Modelo Utilizado

Este projeto utiliza:

* Amazon Chronos
* `amazon/chronos-t5-small`

Chronos é um modelo pré-treinado de previsão temporal construído sobre a arquitetura T5.