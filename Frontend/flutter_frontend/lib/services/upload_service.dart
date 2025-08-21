import 'package:dio/dio.dart';
import 'api_client.dart';
import 'package:http_parser/http_parser.dart'; // per MediaType
//Assumo che backend accetti un campo file in multipart/form-data.
/// Invio di un PDF come multipart/form-data al backend.
/// Richiede che ApiClient aggiunga automaticamente l'Authorization Bearer.
class UploadService {
  final _api = ApiClient();

  Future<Map<String, dynamic>> uploadPdf(String filePath) async {
    final fileName = filePath.split('/').last;
    print("➡️  UploadService: preparo upload di $fileName ($filePath)");

    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(
        filePath,
        filename: fileName,
        // opzionale ma utile: specifica il mime del PDF
        contentType: MediaType('application', 'pdf'),
      ),
    });

    try {
      final res = await _api.dio.post(
        '/documents/upload',
        data: formData,
        onSendProgress: (sent, total) {
          if (total > 0) {
            final pct = (sent / total * 100).toStringAsFixed(0);
            // Log leggero: rimuovi se troppo verboso
            // print('⏫ Upload: $pct% ($sent/$total bytes)');
          }
        },
      );

      print("✅ Upload OK: status ${res.statusCode} | data: ${res.data}");
      // Mi aspetto un JSON tipo: { cid: "...", txHash: "0x..." }
      return Map<String, dynamic>.from(res.data);
    } on DioException catch (e) {
      // Gestione errori per Dio 5.x
      final status = e.response?.statusCode;
      final data = e.response?.data;
      print("❌ DioException");
      print("   • type: ${e.type}");
      print("   • message: ${e.message}");
      print("   • status: $status");
      print("   • data: $data");

      // Rilancia un messaggio pulito per la UI
      throw Exception(
        'Upload fallito'
        '${status != null ? ' (HTTP $status)' : ''}'
        '${e.message != null ? ': ${e.message}' : ''}'
        '${data != null ? ' — $data' : ''}',
      );
    } catch (e) {
      print("❌ Errore generico in upload: $e");
      throw Exception('Errore generico durante l`upload: $e');
    }
  }
}