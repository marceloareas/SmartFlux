# DTOs (Data Transfer Objects)

## O que é um DTO?

Um **DTO (Data Transfer Object)** é um objeto simples usado para transferir dados entre as diferentes camadas de uma aplicação, especialmente entre o cliente e o servidor. DTOs contêm apenas dados, sem lógica de negócio complexa.

### Por que usar DTOs?

1. **Segurança**: Mantemos apenas os dados necessários visíveis ao cliente, escondendo informações sensíveis do banco de dados
2. **Validação**: Podemos validar os dados de entrada antes de processar
3. **Flexibilidade**: Desacoplamos a estrutura interna (Entities) da API externa
4. **Transformação**: Permitimos formatos diferentes para entrada e saída
5. **Manutenção**: Mudanças no banco de dados não afetam diretamente os clientes

## Estrutura no Projeto SmartFlux

### Pastas Principais

- **`request/`** - DTOs para dados enviados pelo cliente para o servidor
  - Exemplo: `LoginRequest.java` - dados que o cliente envia para fazer login

- **`response/`** - DTOs para dados que o servidor envia de volta ao cliente
  - Exemplo: `LoginResponse.java` - token e informações do usuário após login bem-sucedido

## Fluxo de Dados Completo

```
1. ENTRADA (Request)
   Cliente envia JSON
        ↓
   JSON é deserializado para DTO (ex: LoginRequest)
        ↓
   Validações são executadas (@NotEmpty, @Email, etc)
        ↓
   
2. PROCESSAMENTO
   Controller recebe o DTO válido
        ↓
   Service converte DTO → Entity
        ↓
   Repository salva Entity no banco de dados
        ↓
   
3. SAÍDA (Response)
   Entity é recuperada do banco
        ↓
   Service/Controller converte Entity → DTO de resposta
        ↓
   DTO é serializado para JSON
        ↓
   Cliente recebe JSON com os dados
```

## Exemplo Prático: Login

### Request (LoginRequest.java)
```java
public record LoginRequest(
    @NotEmpty(message = "Email é obrigatório") String email,
    @NotEmpty(message = "Senha é obrigatória") String password) {
}
```
- Cliente envia: `{ "email": "user@example.com", "password": "senha123" }`
- DTO valida e garante que ambos os campos existem

### Response (LoginResponse.java)
```java
public record LoginResponse(String token, String name, String email) {
}
```
- Servidor retorna: `{ "token": "jwt...", "name": "João", "email": "user@example.com" }`
- Note: A senha **nunca** é devolvida, apenas dados públicos/necessários

## Boas Práticas

✅ **Faça:**
- Use Records para DTOs (mais simples e imutável)
- Valide dados em DTOs de request
- Retorne apenas dados necessários em responses
- Use nomes descritivos (LoginRequest, CreateAccountRequest, etc)

❌ **Evite:**
- Retornar Entities diretamente ao cliente
- Expor columnas sensíveis do banco
- Reutilizar o mesmo DTO para diferentes operações sem necessidade
- DTOs com lógica de negócio complexa