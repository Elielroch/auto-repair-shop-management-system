"""
Módulo de detecção de objetos usando YOLO em formato ONNX com OpenCV DNN para baixo consumo de memória.
"""

import cv2
import numpy as np
from PIL import Image
import io
import base64

# Lista de classes do COCO (80 classes) para mapear a saída do modelo YOLOv8 ONNX
COCO_CLASSES = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
    'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
    'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
    'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
    'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
    'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
    'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
    'hair drier', 'toothbrush'
]

class ObjectDetector:
    def __init__(self, model_path='yolov8n.onnx', conf_threshold=0.4, nms_threshold=0.45):
        """Inicializa o detector de objetos com modelo YOLO ONNX."""
        
        # Carregar o modelo ONNX usando OpenCV DNN
        self.net = cv2.dnn.readNetFromONNX(model_path)
        self.input_width = 640
        self.input_height = 640
        self.conf_threshold = conf_threshold
        self.nms_threshold = nms_threshold
        self.classes = COCO_CLASSES
        
        # Classes do COCO que podem ser análogas a ferramentas para demonstração
        self.target_classes = [
            'scissors', # Ferramenta de corte
            'knife',    # Ferramenta de corte
            'bottle',   # Análogo a um container/frasco
            'cup',      # Análogo a um recipiente
            'bowl',     # Análogo a um recipiente para peças
            'remote',   # Formato similar a algumas ferramentas
            'cell phone'# Formato similar a ferramentas de medição
        ]

        # Mapeamento de categorias para as classes do COCO
        self.tool_categories = {
            'cutting_tools': ['scissors', 'knife'],
            'hand_tools': ['remote', 'cell phone'], # Placeholder para ferramentas manuais
        }
        
        # Mapeamento de tradução para nomes de exibição em português
        self.translation_map = {
            'scissors': 'Tesoura',
            'knife': 'Faca',
            'bottle': 'Garrafa',
            'cup': 'Copo',
            'bowl': 'Tigela',
            'remote': 'Controle Remoto',
            'cell phone': 'Celular'
        }
        
    def detect_objects(self, image_data):
        """
        Detecta objetos em uma imagem usando o modelo ONNX.
        
        Args:
            image_data: Dados da imagem em formato base64 ou bytes
            
        Returns:
            dict: Resultados da detecção com objetos encontrados
        """
        try:
            # 1. Pré-processamento da imagem
            if isinstance(image_data, str):
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                image_bytes = base64.b64decode(image_data)
            else:
                image_bytes = image_data
                
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            original_image = np.array(image)
            
            # Criar o blob de entrada para a rede neural
            blob = cv2.dnn.blobFromImage(
                original_image, 
                1/255.0, 
                (self.input_width, self.input_height), 
                swapRB=True, 
                crop=False
            )
            
            # 2. Executar a inferência
            self.net.setInput(blob)
            outputs = self.net.forward(self.net.getUnconnectedOutLayersNames())
            
            # O YOLOv8 ONNX tem uma saída de formato (1, 84, 8400)
            # Transpor para (8400, 84)
            predictions = np.squeeze(outputs[0]).T
            
            # 3. Pós-processamento (NMS)
            
            # Obter as caixas delimitadoras, scores e classes
            boxes = predictions[:, :4]
            scores = predictions[:, 4:]
            
            # Escalar as caixas para o tamanho original da imagem
            ratios = np.array([
                original_image.shape[1] / self.input_width, 
                original_image.shape[0] / self.input_height, 
                original_image.shape[1] / self.input_width, 
                original_image.shape[0] / self.input_height
            ])
            
            # Converter de formato (center_x, center_y, width, height) para (x1, y1, x2, y2)
            boxes = boxes * ratios
            boxes_xyxy = np.copy(boxes)
            boxes_xyxy[:, 0] = boxes[:, 0] - boxes[:, 2] / 2  # x1 = center_x - width/2
            boxes_xyxy[:, 1] = boxes[:, 1] - boxes[:, 3] / 2  # y1 = center_y - height/2
            boxes_xyxy[:, 2] = boxes[:, 0] + boxes[:, 2] / 2  # x2 = center_x + width/2
            boxes_xyxy[:, 3] = boxes[:, 1] + boxes[:, 3] / 2  # y2 = center_y + height/2
            
            # Encontrar a classe com maior score para cada detecção
            class_ids = np.argmax(scores, axis=1)
            confidences = np.max(scores, axis=1)
            
            # Filtrar por limiar de confiança
            valid_indices = confidences > self.conf_threshold
            boxes_xyxy = boxes_xyxy[valid_indices]
            confidences = confidences[valid_indices]
            class_ids = class_ids[valid_indices]
            
            # Aplicar Non-Maximum Suppression (NMS)
            indices = cv2.dnn.NMSBoxes(
                boxes_xyxy.tolist(), 
                confidences.tolist(), 
                self.conf_threshold, 
                self.nms_threshold
            )
            
            detections = []
            if len(indices) > 0:
                for i in indices.flatten():
                    class_id = class_ids[i]
                    class_name = self.classes[class_id]
                    confidence = confidences[i]
                    x1, y1, x2, y2 = boxes_xyxy[i]
                    
                    # Filtrar apenas as classes alvo
                    if class_name in self.target_classes:
                        detection = {
                            'class_name': class_name,
                            'display_name': self.translation_map.get(class_name, class_name),
                            'confidence': float(confidence),
                            'bbox': {
                                'x1': float(x1),
                                'y1': float(y1),
                                'x2': float(x2),
                                'y2': float(y2)
                            }
                        }
                        detections.append(detection)
            
            return {
                'success': True,
                'detections': detections,
                'total_objects': len(detections)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'detections': [],
                'total_objects': 0
            }
    
    def classify_tool_type(self, class_name, confidence):
        """
        Classifica o tipo de ferramenta baseado no nome da classe detectada.
        
        Args:
            class_name: Nome da classe detectada
            confidence: Confiança da detecção
            
        Returns:
            dict: Informações sobre o tipo de ferramenta
        """
        for category, tools in self.tool_categories.items():
            if class_name in tools:
                return {
                    'category': category,
                    'tool_type': class_name,
                    'confidence': confidence,
                    'description': self._get_tool_description(class_name)
                }
        
        return {
            'category': 'unknown',
            'tool_type': class_name,
            'confidence': confidence,
            'description': f'Objeto detectado: {class_name}'
        }
    
    def _get_tool_description(self, class_name):
        """Retorna descrição detalhada da ferramenta."""
        descriptions = {
            'scissors': 'Tesoura - Ferramenta de corte',
            'knife': 'Faca - Ferramenta de corte afiada',
            'bottle': 'Garrafa - Pode ser usada para armazenar líquidos',
            'cup': 'Copo - Recipiente para líquidos ou peças pequenas',
            'bowl': 'Tigela - Recipiente para organizar componentes',
            'remote': 'Controle Remoto - Dispositivo de controle eletrônico',
            'cell phone': 'Celular - Pode ser usado como ferramenta de medição ou consulta'
        }
        
        translated_name = self.translation_map.get(class_name, class_name)
        return descriptions.get(class_name, f'Objeto detectado: {translated_name}')
