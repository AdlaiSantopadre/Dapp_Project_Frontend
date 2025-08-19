import 'package:dio/dio.dart';
import 'api_client.dart';
//Assumo che il tuo backend accetti un campo file in multipart/form-data.
class UploadService {
  final _api = ApiClient();

  Future<Map<String, dynamic>> uploadPdf(String filePath) async {
    final fileName = filePath.split('/').last;

    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath, filename: fileName),
    });

    final res = await _api.dio.post('/documents/upload', data: formData);

    if (res.statusCode == 200) {
      return res.data as Map<String, dynamic>;
    } else {
      throw Exception('Errore upload documento');
    }
  }
}
