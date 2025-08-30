import 'package:dio/dio.dart';
import 'api_client.dart';
//serve per la parte in cui il certificatore (o altro utente) 
//deve vedere la lista degli impianti configurati e scegliere 
//su quale impianto registrare il documento.


class ImpiantiService {
  final _api = ApiClient();

  Future<List<Map<String, dynamic>>> listImpianti() async {
    try {
      final res = await _api.dio.get('/impianti');

      if (res.statusCode == 200) {
        final data = res.data as List;
        // 🔎 garantiamo tipo consistente: lista di Map<String,dynamic>
        return data.map((e) => Map<String, dynamic>.from(e)).toList();
      } else {
        throw Exception('Errore caricamento impianti (HTTP ${res.statusCode})');
      }
    } on DioException catch (e) {
      throw Exception('Errore di rete: ${e.message}');
    } catch (e) {
      throw Exception('Errore imprevisto: $e');
    }
  }
}
