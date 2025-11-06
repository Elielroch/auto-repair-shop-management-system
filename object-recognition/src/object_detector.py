"""
Módulo de detecção de objetos usando YOLO para reconhecimento de ferramentas e parafusos.
"""

import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image
import io
import base64

class ObjectDetector:
    def __init__(self):
        """Inicializa o detector de objetos com modelo YOLO pré-treinado."""
        # Usar modelo YOLO pré-treinado
        self.model = YOLO('yolov8n.pt')  # nano version for faster inference
        
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
        Detecta objetos em uma imagem.
        
        Args:
            image_data: Dados da imagem em formato base64 ou bytes
            
        Returns:
            dict: Resultados da detecção com objetos encontrados
        """
        try:
            # Converter dados da imagem
            if isinstance(image_data, str):
                # Se for base64, decodificar
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                image_bytes = base64.b64decode(image_data)
            else:
                image_bytes = image_data
                
            # Converter para PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Converter para array numpy
            image_array = np.array(image)
            
            # Executar detecção
            results = self.model(image_array)
            
            # Processar resultados
            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Extrair informações da detecção
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()
                        class_id = int(box.cls[0].cpu().numpy())
                        class_name = self.model.names[class_id]
                        
                        # Filtrar apenas as classes alvo com confiança razoável
                        if class_name in self.target_classes and confidence > 0.4:
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
