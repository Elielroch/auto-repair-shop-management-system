# Comandos Essenciais para o Projeto Docker

 

## 1. Iniciar o Projeto (Construir Imagens e Subir Contêineres)

Este é o comando principal para construir as imagens Docker (se houver alterações nos `Dockerfile`s ou no código) e iniciar todos os serviços em segundo plano.

```bash
docker compose up -d --build
```

-   `up`: Constrói, (re)cria, inicia e anexa aos contêineres de um serviço.
-   `-d`: (Detached mode) Executa os contêineres em segundo plano, liberando seu terminal.
-   `--build`: Força a reconstrução das imagens. Use sempre que fizer alterações nos `Dockerfile`s ou no código-fonte que é copiado para dentro das imagens.

---

## 2. Parar e Remover os Contêineres

Para parar e remover todos os contêineres, redes e volumes definidos no `docker-compose.yml`.

```bash
docker compose down
```

-   **Para remover também o volume de dados do backend (`backend_data`):**
    ```bash
    docker-compose down -v
    ```

---

## 3. Visualizar os Logs dos Serviços

Essencial para depuração e monitoramento.

-   **Ver os logs de todos os serviços em tempo real:**
    ```bash
    docker-compose logs -f
    ```
-   **Ver os logs de um serviço específico em tempo real (ex: `backend`):**
    ```bash
    docker-compose logs -f backend
    ```
    (Substitua `backend` por `recognition` ou `frontend` conforme necessário).

-   **Ver os logs de todos os serviços (histórico):**
    ```bash
    docker-compose logs
    ```

---

## 4. Listar Contêineres em Execução

Para verificar quais contêineres estão ativos e seus status.

```bash
docker-compose ps
```


 Limpeza Agressiva do Docker (Comando Mais Importante)
docker system prune -a
