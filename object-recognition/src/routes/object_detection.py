"""
Rotas da API para detecção de objetos.
"""

from flask import Blueprint, request, jsonify
from src.object_detector import ObjectDetector
import base64
import io

# Criar blueprint para as rotas de detecção de objetos
object_detection_bp = Blueprint('object_detection', __name__)

# Instanciar o detector de objetos
detector = ObjectDetector()

@object_detection_bp.route('/detect', methods=['POST'])
def detect_objects():
    """
    Endpoint para detectar objetos em uma imagem.
    
    Espera um JSON com:
    {
        "image": "data:image/jpeg;base64,..." ou dados base64 da imagem
    }
    
    Retorna:
    {
        "success": true/false,
        "detections": [...],
        "total_objects": number,
        "error": "mensagem de erro se houver"
    }
    """
    try:
        # Verificar se há dados na requisição
        if not request.json:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado JSON fornecido',
                'detections': [],
                'total_objects': 0
            }), 400
        
        # Extrair dados da imagem
        image_data = request.json.get('image')
        if not image_data:
            return jsonify({
                'success': False,
                'error': 'Campo "image" não encontrado',
                'detections': [],
                'total_objects': 0
            }), 400
        
        # Executar detecção
        results = detector.detect_objects(image_data)
        
        # Adicionar classificação de ferramentas aos resultados
        if results['success'] and results['detections']:
            for detection in results['detections']:
                tool_info = detector.classify_tool_type(
                    detection['class_name'], 
                    detection['confidence']
                )
                detection.update(tool_info)
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro interno do servidor: {str(e)}',
            'detections': [],
            'total_objects': 0
        }), 500

@object_detection_bp.route('/health', methods=['GET'])
def health_check():
    """Endpoint para verificar se o serviço está funcionando."""
    return jsonify({
        'status': 'healthy',
        'service': 'object-detection-api',
        'version': '1.0.0'
    })

@object_detection_bp.route('/classes', methods=['GET'])
def get_supported_classes():
    """Retorna as classes de objetos suportadas pelo modelo."""
    return jsonify({
        'supported_classes': detector.classes,
        'target_classes': detector.target_classes, # Classes que o app considera relevantes
        'total_supported_classes': len(detector.classes)
    })
