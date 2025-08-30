import 'package:dio/dio.dart';
import 'api_client.dart';
import 'package:http_parser/http_parser.dart';
import 'dart:typed_data';
 // per MediaType
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
    return _doUpload(formData);
  }

/// 🔧 Nuovo metodo per caricare immagini (es. QR code) da byte array
  Future<Map<String, dynamic>> uploadImageBytes(
    Uint8List bytes, {
    String fileName = 'qrcode.png',
    String? token, //
  }) async {
    print("➡️  UploadService: preparo upload immagine $fileName (${bytes.length} bytes)");

    final formData = FormData.fromMap({
      'file': MultipartFile.fromBytes(
        bytes,
        filename: fileName,
        contentType: MediaType('image', 'png'),
      ),
    });
  


    return _doUpload(formData,token: token);
  }



/// funzione interna condivisa
  Future<Map<String, dynamic>> _doUpload(FormData formData,{String? token}) async {
    try {
      final res = await _api.dio.post(
        '/documents/upload',
        data: formData,
        options: Options(
        headers: token != null ? {"Authorization": "Bearer $token"} : {},
      ),
        onSendProgress: (sent, total) {
          if (total > 0) {
            final pct = (sent / total * 100).toStringAsFixed(0);
            // Log leggero: rimuovi se troppo verboso
            print('⏫ Upload: $pct% ($sent/$total bytes)');
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