import 'package:dio/dio.dart';
import 'api_client.dart';

//Assumo che il tuo backend accetti un campo file in multipart/form-data.
class UploadService {
  final _api = ApiClient();

  Future<Map<String, dynamic>> uploadPdf(String filePath) async {
    final fileName = filePath.split('/').last;

    print("DEBUG: Uploading file $fileName from $filePath");

    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath, filename: fileName),
    });

    final res = await _api.dio.post('/documents/upload', data: formData);
    print("DEBUG: Response status ${res.statusCode}, data: ${res.data}");
    if (res.statusCode == 200) {
      return res.data as Map<String, dynamic>;
    } else {
  throw DioException(
    requestOptions: res.requestOptions,
    response: res,
    type: DioExceptionType.badResponse,
    );
    }
  }
}
