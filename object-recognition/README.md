# Aplicativo Web de Reconhecimento de Objetos para Mecânicos

## Descrição

Este é um aplicativo web desenvolvido para mecânicos que permite o reconhecimento automático de ferramentas e objetos através de inteligência artificial. O sistema utiliza modelos de visão computacional avançados para identificar e classificar objetos em imagens e **em tempo real via câmera**.

## Características Principais

- **Reconhecimento de Objetos**: Utiliza o modelo YOLO (You Only Look Once) para detecção em tempo real
- **Interface Responsiva**: Design moderno e responsivo que funciona em desktop e dispositivos móveis
- **Upload de Imagens**: Suporte para drag-and-drop e seleção manual de arquivos
- **🆕 Detecção em Tempo Real**: Acesso à câmera do dispositivo para reconhecimento instantâneo
- **Análise Detalhada**: Fornece informações sobre confiança, categoria e tipo de objeto detectado
- **API RESTful**: Backend robusto com endpoints para integração
- **Cache Inteligente**: Sistema de cache para otimizar performance em tempo real

## Tecnologias Utilizadas

### Backend
- **Flask**: Framework web Python
- **YOLO (Ultralytics)**: Modelo de detecção de objetos
- **OpenCV**: Processamento de imagens
- **TensorFlow**: Framework de machine learning
- **Pillow**: Manipulação de imagens
- **Flask-CORS**: Suporte a requisições cross-origin

### Frontend
- **HTML5/CSS3**: Estrutura e estilização
- **JavaScript**: Interatividade e comunicação com API
- **WebRTC**: Acesso à câmera para tempo real
- **Canvas API**: Processamento de frames de vídeo
- **Design Responsivo**: Compatível com dispositivos móveis

## Estrutura do Projeto

```
object-recognition-app/
├── src/
│   ├── main.py                 # Aplicação principal Flask
│   ├── object_detector.py      # Módulo de detecção de objetos
│   ├── routes/
│   │   ├── object_detection.py # Rotas da API de detecção
│   │   └── user.py            # Rotas de usuário (template)
│   ├── models/
│   │   └── user.py            # Modelos de banco de dados
│   ├── static/
│   │   └── index.html         # Interface web principal
│   └── database/
│       └── app.db             # Banco de dados SQLite
├── dataset/
│   └── images/                # Imagens de exemplo
├── venv/                      # Ambiente virtual Python
├── requirements.txt           # Dependências do projeto
└── README.md                  # Este arquivo
```

## Instalação e Configuração

### Pré-requisitos
- Python 3.11+
- pip (gerenciador de pacotes Python)

### Passos de Instalação

1. **Clone ou baixe o projeto**
   ```bash
   cd object-recognition-app
   ```

2. **Ative o ambiente virtual**
   ```bash
   source venv/bin/activate  # Linux/Mac
   # ou
   venv\Scripts\activate     # Windows
   ```

3. **Instale as dependências**
   ```bash
   pip install -r requirements.txt
   ```

4. **Execute o aplicativo**
   ```bash
   python src/main.py
   ```

5. **Acesse o aplicativo**
   Abra seu navegador e vá para: `http://localhost:5000`

## Como Usar

### Interface Web

1. **Upload de Imagem**
   - Clique em "Selecionar Imagem" ou arraste uma imagem para a área de upload
   - Formatos suportados: JPG, PNG, GIF, BMP

2. **🆕 Câmera em Tempo Real**
   - Clique em "📹 Câmera em Tempo Real" para ativar a câmera
   - Permita o acesso à câmera quando solicitado pelo navegador
   - Clique em "🔍 Iniciar Detecção" para começar o reconhecimento automático
   - Aponte a câmera para ferramentas ou objetos para detecção instantânea
   - Use "⏸️ Pausar Detecção" para pausar o reconhecimento
   - Use "⏹️ Parar Câmera" para desativar a câmera

3. **Análise**
   - Para imagens: após selecionar, clique em "Analisar Imagem"
   - Para tempo real: a detecção acontece automaticamente a cada segundo
   - O sistema processará usando IA e mostrará os resultados

4. **Resultados**
   - Visualize os objetos detectados com informações detalhadas
   - Cada detecção mostra: tipo, categoria, nível de confiança
   - Em tempo real: caixas coloridas aparecem ao redor dos objetos detectados

### API Endpoints

#### Health Check
```
GET /api/health
```
Verifica se o serviço está funcionando.

#### Classes Suportadas
```
GET /api/classes
```
Retorna as classes de objetos que o modelo pode detectar.

#### Detecção de Objetos (Upload)
```
POST /api/detect
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,..."
}
```

#### 🆕 Detecção em Tempo Real (Otimizada)
```
POST /api/detect-realtime
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,...",
  "threshold": 0.4
}
```

#### 🆕 Estatísticas de Performance
```
GET /api/performance
```
Retorna informações sobre cache e performance do sistema.

#### 🆕 Limpar Cache
```
POST /api/clear-cache
```
Limpa o cache de detecções para liberar memória.

**Resposta:**
```json
{
  "success": true,
  "detections": [
    {
      "class_name": "scissors",
      "confidence": 0.85,
      "category": "cutting_tools",
      "tool_type": "scissors",
      "description": "Tesoura - Ferramenta de corte",
      "bbox": {
        "x1": 100,
        "y1": 150,
        "x2": 200,
        "y2": 250
      }
    }
  ],
  "total_objects": 1
}
```

## Categorias de Objetos

O sistema classifica objetos detectados nas seguintes categorias:

- **Ferramentas de Corte**: Tesouras, facas, lâminas
- **Fixadores/Parafusos**: Parafusos, porcas, arruelas
- **Ferramentas Manuais**: Chaves, alicates, martelos
- **Ferramentas de Medição**: Réguas, esquadros
- **Outros**: Objetos diversos

## Desenvolvimento e Personalização

### Adicionando Novas Classes

Para adicionar suporte a novos tipos de objetos:

1. **Edite o arquivo `src/object_detector.py`**
   - Adicione novas classes em `target_classes`
   - Atualize `tool_categories` com as novas categorias
   - Adicione descrições em `_get_tool_description`

2. **Treine um modelo personalizado** (opcional)
   - Colete imagens dos novos objetos
   - Use ferramentas como Roboflow para treinar
   - Substitua o modelo YOLO padrão

### Melhorias Futuras

- **Modelo Personalizado**: Treinar modelo específico para ferramentas mecânicas
- **Banco de Dados**: Armazenar histórico de detecções
- **Autenticação**: Sistema de login para usuários
- **Relatórios**: Gerar relatórios de uso e estatísticas
- **Mobile App**: Versão nativa para smartphones

## Troubleshooting

### Problemas Comuns

1. **Erro de dependências**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

2. **Modelo YOLO não baixa**
   - Verifique conexão com internet
   - O modelo será baixado automaticamente na primeira execução

3. **Erro de memória**
   - Use modelo menor: `yolov8n.pt` (nano) em vez de versões maiores
   - Reduza resolução das imagens de entrada

4. **Interface não carrega**
   - Verifique se o Flask está rodando na porta 5000
   - Teste acessando `http://127.0.0.1:5000`

## Licença

Este projeto foi desenvolvido para fins educacionais e de demonstração. 

## Suporte

Para dúvidas ou problemas:
1. Verifique a seção de troubleshooting
2. Consulte a documentação das bibliotecas utilizadas
3. Teste os endpoints da API individualmente

## Contribuições

Contribuições são bem-vindas! Para contribuir:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request





