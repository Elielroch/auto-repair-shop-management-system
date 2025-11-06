"""
Rotas otimizadas para detecção de objetos em tempo real.
"""

from flask import Blueprint, request, jsonify
from src.object_detector import ObjectDetector
import time
import threading
import queue

# Criar blueprint para as rotas de detecção em tempo real
realtime_detection_bp = Blueprint('realtime_detection', __name__)

# Instanciar o detector de objetos
detector = ObjectDetector()

# Cache para otimizar performance
detection_cache = {}
cache_timeout = 2  # segundos

@realtime_detection_bp.route('/detect-realtime', methods=['POST'])
def detect_objects_realtime():
    """
    Endpoint otimizado para detecção de objetos em tempo real.
    
    Espera um JSON com:
    {
        "image": "data:image/jpeg;base64,..." ou dados base64 da imagem,
        "threshold": 0.5 (opcional, padrão 0.3)
    }
    
    Retorna:
    {
        "success": true/false,
        "detections": [...],
        "total_objects": number,
        "processing_time": seconds,
        "error": "mensagem de erro se houver"
    }
    """
    start_time = time.time()
    
    try:
        # Verificar se há dados na requisição
        if not request.json:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado JSON fornecido',
                'detections': [],
                'total_objects': 0,
                'processing_time': 0
            }), 400
        
        # Extrair dados da imagem
        image_data = request.json.get('image')
        threshold = request.json.get('threshold', 0.3)
        
        if not image_data:
            return jsonify({
                'success': False,
                'error': 'Campo "image" não encontrado',
                'detections': [],
                'total_objects': 0,
                'processing_time': 0
            }), 400
        
        # Verificar cache (opcional para otimização)
        image_hash = hash(image_data[:100])  # Hash simples dos primeiros 100 caracteres
        current_time = time.time()
        
        if image_hash in detection_cache:
            cached_result, cached_time = detection_cache[image_hash]
            if current_time - cached_time < cache_timeout:
                cached_result['processing_time'] = time.time() - start_time
                cached_result['cached'] = True
                return jsonify(cached_result)
        
        # Executar detecção
        results = detector.detect_objects(image_data)
        results = detector.detect_objects(image_data, confidence_threshold=threshold)
        
        # Filtrar detecções por threshold
        if results['success'] and results['detections']:
            filtered_detections = []
            for detection in results['detections']:
                if detection['confidence'] >= threshold:
                    # Adicionar classificação de ferramentas
                    tool_info = detector.classify_tool_type(
                        detection['class_name'], 
                        detection['confidence']
                    )
                    detection.update(tool_info)
                    filtered_detections.append(detection)
            
            results['detections'] = filtered_detections
            results['total_objects'] = len(filtered_detections)
        
        # Adicionar tempo de processamento
        processing_time = time.time() - start_time
        results['processing_time'] = processing_time
        results['cached'] = False
        
        # Atualizar cache
        detection_cache[image_hash] = (results.copy(), current_time)
        
        # Limpar cache antigo (manter apenas últimas 10 entradas)
        if len(detection_cache) > 10:
            oldest_key = min(detection_cache.keys(), 
                           key=lambda k: detection_cache[k][1])
            del detection_cache[oldest_key]
        
        return jsonify(results)
        
    except Exception as e:
        processing_time = time.time() - start_time
        return jsonify({
            'success': False,
            'error': f'Erro interno do servidor: {str(e)}',
            'detections': [],
            'total_objects': 0,
            'processing_time': processing_time,
            'cached': False
        }), 500

@realtime_detection_bp.route('/performance', methods=['GET'])
def get_performance_stats():
    """Retorna estatísticas de performance do sistema."""
    return jsonify({
        'cache_size': len(detection_cache),
        'cache_timeout': cache_timeout,
        'model_loaded': hasattr(detector, 'model') and detector.model is not None,
        'supported_classes': len(detector.model.names) if hasattr(detector, 'model') else 0
    })

@realtime_detection_bp.route('/clear-cache', methods=['POST'])
def clear_cache():
    """Limpa o cache de detecções."""
    global detection_cache
    detection_cache.clear()
    return jsonify({
        'success': True,
        'message': 'Cache limpo com sucesso'
    })

