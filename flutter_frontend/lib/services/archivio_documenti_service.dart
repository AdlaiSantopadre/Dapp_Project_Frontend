import 'package:dio/dio.dart';
import 'api_client.dart';

class ArchivioDocumentiService {
  final _api = ApiClient();

  /// 📌 Elenco documenti di un impianto
  Future<List<Map<String, dynamic>>> listByImpianto(String impiantoId) async {
    try {
      final res = await _api.dio.get('/archivio-documenti/impianto/$impiantoId');

      if (res.statusCode == 200) {
        final data = res.data as List;
        return data.map((e) => Map<String, dynamic>.from(e)).toList();
      } else {
        throw Exception('Errore caricamento documenti (HTTP ${res.statusCode})');
      }
    } on DioException catch (e) {
      throw Exception('Errore rete durante caricamento documenti: ${e.message}');
    } catch (e) {
      throw Exception('Errore imprevisto: $e');
    }
  }

  /// 📑 Lista completa di tutti i documenti
  Future<List<Map<String, dynamic>>> listAll() async {
    final response = await _api.dio.get('/archivio-documenti');
    if (response.statusCode == 200) {
      final List data = response.data;
      return List<Map<String, dynamic>>.from(data);
    } else {
      throw Exception('Errore caricamento documenti');
    }
  }
  /// 📌 Recupera un documento specifico per ID
  Future<Map<String, dynamic>> getById(String id) async {
    try {
      final res = await _api.dio.get('/archivio-documenti/$id');

      if (res.statusCode == 200) {
        return Map<String, dynamic>.from(res.data);
      } else if (res.statusCode == 404) {
        throw Exception('Documento non trovato');
      } else {
        throw Exception('Errore caricamento documento (HTTP ${res.statusCode})');
      }
    } on DioException catch (e) {
      throw Exception('Errore rete durante caricamento documento: ${e.message}');
    } catch (e) {
      throw Exception('Errore imprevisto: $e');
    }
  }
}